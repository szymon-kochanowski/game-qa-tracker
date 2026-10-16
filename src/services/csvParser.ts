import { BugTicket, Priority, RegreTab } from '../types';
import {
  guessBugTypeFromSummary,
  getInitialPlatformTargets,
  calculateSortHelper,
} from './triage';

export interface ParseResult {
  added: BugTicket[];
  updated: { bugId: string; summary: string; priority: Priority }[];
  skippedCrossTab: { bugId: string; existingTabName: string }[];
  errors: string[];
}

/**
 * Parses CSV text, handling quotes, newlines inside quotes, and both comma and tab delimiters.
 */
export function parseCSVText(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  const text = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\t' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Ingestion engine conforming to JiraImport.gs:
 * - Identifies "Issue key" / "Bug ID", "Summary", "Priority"
 * - Checks cross-tab duplicates across other Regre tabs
 * - If bug exists in target tab: updates summary, priority, bugType while preserving QA progress
 * - If bug exists in another tab: skips and flags warning
 * - If new: appends with auto-categorized bugType and platform targets
 */
export function processJiraCsvImport(
  csvData: string,
  targetTabId: string,
  allTabs: RegreTab[]
): ParseResult {
  const result: ParseResult = {
    added: [],
    updated: [],
    skippedCrossTab: [],
    errors: [],
  };

  const rows = parseCSVText(csvData);
  if (rows.length < 2) {
    result.errors.push('No data rows found in CSV. Expected at least header and one data row.');
    return result;
  }

  const targetTab = allTabs.find((t) => t.id === targetTabId);
  if (!targetTab) {
    result.errors.push('Target regression tab not found.');
    return result;
  }

  const headers = rows[0].map((h) => h.toLowerCase().trim());

  const getColIndex = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h) => h === name.toLowerCase());
      if (idx !== -1) return idx;
    }
    // Partial search
    for (const name of names) {
      const idx = headers.findIndex((h) => h.includes(name.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const keyIdx = getColIndex(['issue key', 'bug id', 'issue id', 'key', 'id']);
  const summaryIdx = getColIndex(['summary', 'title', 'issue summary', 'description']);
  const priorityIdx = getColIndex(['priority', 'severity']);
  const blockedByIdx = getColIndex(['blocked by', 'blocked']);
  const commentIdx = getColIndex(['comment', 'notes']);

  if (keyIdx === -1) {
    result.errors.push("Could not find 'Issue key' or 'Bug ID' column in CSV headers.");
    return result;
  }

  // 1. Map existing bugs in target tab
  const targetExisting = new Set(targetTab.tickets.map((t) => t.bugId.toUpperCase().trim()));

  // 2. Map existing bugs in all other tabs
  const otherExistingMap = new Map<string, string>(); // bugId -> tabName
  for (const tab of allTabs) {
    if (tab.id !== targetTabId) {
      for (const t of tab.tickets) {
        otherExistingMap.set(t.bugId.toUpperCase().trim(), tab.name);
      }
    }
  }

  const validPriorities: Priority[] = ['Critical', 'Highest', 'High', 'Medium', 'Low', 'Lowest'];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawKey = row[keyIdx]?.trim();
    if (!rawKey || rawKey.toUpperCase() === 'DO-NOT-TOUCH' || rawKey.toLowerCase() === 'template row - leave alone') {
      continue;
    }

    const bugId = rawKey.toUpperCase();
    const rawSummary = summaryIdx !== -1 && row[summaryIdx] ? row[summaryIdx].trim() : '';
    const rawPriority = priorityIdx !== -1 && row[priorityIdx] ? row[priorityIdx].trim() : 'Medium';
    const blockedBy = blockedByIdx !== -1 && row[blockedByIdx] ? row[blockedByIdx].trim() : '';
    const comment = commentIdx !== -1 && row[commentIdx] ? row[commentIdx].trim() : '';

    // Normalize priority
    let priority: Priority = 'Medium';
    const matchPri = validPriorities.find((p) => p.toLowerCase() === rawPriority.toLowerCase());
    if (matchPri) priority = matchPri;

    if (targetExisting.has(bugId)) {
      // Update existing in target tab
      result.updated.push({
        bugId,
        summary: rawSummary,
        priority,
      });
    } else if (otherExistingMap.has(bugId)) {
      // Duplicate in another tab
      result.skippedCrossTab.push({
        bugId,
        existingTabName: otherExistingMap.get(bugId)!,
      });
    } else {
      // New bug
      const bugType = guessBugTypeFromSummary(rawSummary);
      const platforms = getInitialPlatformTargets(bugType);
      const now = new Date().toISOString();

      const newTicket: BugTicket = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        bugId,
        summary: rawSummary || `Issue ${bugId}`,
        priority,
        bugType,
        blockedBy: blockedBy || undefined,
        comment: comment || undefined,
        pcStatus: platforms.pc,
        ps5Status: platforms.ps5,
        xsxStatus: platforms.xsx,
        switch2Status: platforms.switch2,
        status: 'To Test',
        sortHelper: calculateSortHelper(priority, 'To Test'),
        createdAt: now,
        updatedAt: now,
      };

      result.added.push(newTicket);
      targetExisting.add(bugId);
    }
  }

  return result;
}

/**
 * Exports a RegreTab tickets to CSV string matching spreadsheet layout.
 */
export function exportTabToCSV(tab: RegreTab, jiraBaseUrl: string): string {
  const headers = [
    'Jira link',
    'Bug ID',
    'Summary',
    'Priority',
    'Bug Type',
    'Blocked by',
    'Comment',
    'Platforms left',
    'PC',
    'PC Build Number',
    'PS5',
    'PS5 Build Number',
    'XSX',
    'XSX Build Number',
    'Switch 2',
    'Switch Build Number',
    'Status',
    'Date',
    'Sort Helper',
  ];

  const lines = [headers.join(',')];

  for (const t of tab.tickets) {
    const jiraLink = `"${jiraBaseUrl}${t.bugId}"`;
    const cleanSummary = `"${(t.summary || '').replace(/"/g, '""')}"`;
    const cleanComment = `"${(t.comment || '').replace(/"/g, '""')}"`;
    const blockedBy = `"${t.blockedBy || ''}"`;

    const row = [
      jiraLink,
      `"${t.bugId}"`,
      cleanSummary,
      `"${t.priority}"`,
      `"${t.bugType}"`,
      blockedBy,
      cleanComment,
      `""`,
      `"${t.pcStatus}"`,
      `"${t.pcBuild || ''}"`,
      `"${t.ps5Status}"`,
      `"${t.ps5Build || ''}"`,
      `"${t.xsxStatus}"`,
      `"${t.xsxBuild || ''}"`,
      `"${t.switch2Status}"`,
      `"${t.switch2Build || ''}"`,
      `"${t.status}"`,
      `"${t.dateStamped || ''}"`,
      t.sortHelper ?? 0,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}
