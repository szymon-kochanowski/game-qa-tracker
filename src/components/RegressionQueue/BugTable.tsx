import React from 'react';
import {
  ExternalLink,
  Copy,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  BugTicket,
  OverallStatus,
  PlatformStatus,
  Priority,
  SortField,
  SortDirection,
  UserAccount,
} from '../../types';
import {
  applyConsoleExclusivity,
  evaluateAutoHandoff,
  calculatePlatformsLeft,
  calculateSortHelper,
} from '../../services/triage';
import { sanitizeUrl } from '../../services/security';

interface BugTableProps {
  tickets: BugTicket[];
  selectedTicketIds: string[];
  jiraBaseUrl: string;
  sortField: SortField;
  sortDirection: SortDirection;
  currentUser: UserAccount | null;
  onSortChange: (field: SortField) => void;
  onToggleSelect: (ticketId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateTicket: (updated: BugTicket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onOpenJiraComment: (ticket: BugTicket) => void;
}

export const BugTable: React.FC<BugTableProps> = ({
  tickets,
  selectedTicketIds,
  jiraBaseUrl,
  sortField,
  sortDirection,
  onSortChange,
  onToggleSelect,
  onSelectAll,
  onUpdateTicket,
  onDeleteTicket,
  onOpenJiraComment,
}) => {
  const allSelected = tickets.length > 0 && selectedTicketIds.length === tickets.length;

  const handlePlatformChange = (
    ticket: BugTicket,
    platform: 'pc' | 'ps5' | 'xsx' | 'switch2',
    newStatus: PlatformStatus
  ) => {
    let pc = ticket.pcStatus;
    let ps5 = ticket.ps5Status;
    let xsx = ticket.xsxStatus;
    let sw2 = ticket.switch2Status;

    if (platform === 'pc') {
      pc = newStatus;
    } else {
      // Console Exclusivity Automation (Triggers.gs)
      const exclusivityResult = applyConsoleExclusivity(platform, newStatus, {
        ps5Status: ps5,
        xsxStatus: xsx,
        switch2Status: sw2,
      });
      ps5 = exclusivityResult.ps5Status;
      xsx = exclusivityResult.xsxStatus;
      sw2 = exclusivityResult.switch2Status;
    }

    // Auto-Handoff & Reverser Automation
    const newOverall = evaluateAutoHandoff(ticket.status, pc, ps5, xsx, sw2);
    let dateStamped = ticket.dateStamped;
    if ((newOverall === 'Done' || newOverall === 'Sent Back') && !dateStamped) {
      dateStamped = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }

    const updatedTicket: BugTicket = {
      ...ticket,
      pcStatus: pc,
      ps5Status: ps5,
      xsxStatus: xsx,
      switch2Status: sw2,
      status: newOverall,
      dateStamped,
      sortHelper: calculateSortHelper(ticket.priority, newOverall),
      updatedAt: new Date().toISOString(),
    };

    onUpdateTicket(updatedTicket);
  };

  const handleOverallStatusChange = (ticket: BugTicket, newOverall: OverallStatus) => {
    let dateStamped = ticket.dateStamped;
    if (newOverall === 'Done' || newOverall === 'Sent Back') {
      dateStamped = new Date().toISOString().replace('T', ' ').slice(0, 16);
    } else if (newOverall === 'In Progress' || newOverall === 'To Test') {
      dateStamped = undefined;
    }

    const updatedTicket: BugTicket = {
      ...ticket,
      status: newOverall,
      dateStamped,
      sortHelper: calculateSortHelper(ticket.priority, newOverall),
      updatedAt: new Date().toISOString(),
    };

    onUpdateTicket(updatedTicket);
  };

  const handlePriorityChange = (ticket: BugTicket, newPriority: Priority) => {
    const updatedTicket: BugTicket = {
      ...ticket,
      priority: newPriority,
      sortHelper: calculateSortHelper(newPriority, ticket.status),
      updatedAt: new Date().toISOString(),
    };

    onUpdateTicket(updatedTicket);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400" />
    );
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'Critical':
        return 'text-rose-400 font-bold';
      case 'Highest':
        return 'text-rose-300 font-semibold';
      case 'High':
        return 'text-amber-300 font-medium';
      case 'Medium':
        return 'text-slate-300';
      case 'Low':
      case 'Lowest':
        return 'text-slate-400';
      default:
        return 'text-slate-300';
    }
  };

  const getPlatformStatusStyle = (status: PlatformStatus) => {
    switch (status) {
      case 'Fixed':
      case 'Done':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      case 'Occurs':
      case 'Sent Back':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/40';
      case 'In Progress':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      case 'To Test':
        return 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40';
      case 'Any Console':
      case 'PS5 or XSX':
        return 'bg-sky-950/40 text-sky-300 border-sky-800/40';
      case 'Blocked':
        return 'bg-purple-950/40 text-purple-300 border-purple-800/40';
      case 'N/A':
        return 'bg-slate-900 text-slate-500 border-slate-800';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getOverallStatusStyle = (status: OverallStatus) => {
    switch (status) {
      case 'To Be Reviewed':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60 font-semibold';
      case 'Done':
        return 'bg-slate-900 text-slate-400 border-slate-800';
      case 'Sent Back':
        return 'bg-rose-950/50 text-rose-300 border-rose-700/60';
      case 'In Progress':
        return 'bg-amber-950/50 text-amber-300 border-amber-700/60';
      case 'Blocked':
        return 'bg-purple-950/50 text-purple-300 border-purple-700/60';
      case 'To Test':
      default:
        return 'bg-slate-950 text-slate-300 border-slate-800';
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <p className="text-sm font-medium text-slate-300 mb-1">No tickets match current filters</p>
        <p className="text-xs text-slate-500">
          Try clearing search query, reset priority sorting, or import a Jira CSV batch.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[880px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold text-[11px] tracking-wider uppercase select-none">
              <th className="py-2.5 px-2.5 w-7 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </th>

              {/* Bug ID column with sort */}
              <th
                onClick={() => onSortChange('bugId')}
                className="py-2.5 px-2 w-24 cursor-pointer group/th hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Bug ID</span>
                  {renderSortIndicator('bugId')}
                </div>
              </th>

              <th className="py-2.5 px-2.5">Summary & Triage</th>

              {/* Priority column with sort */}
              <th
                onClick={() => onSortChange('priority')}
                className="py-2.5 px-2 w-20 cursor-pointer group/th hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {renderSortIndicator('priority')}
                </div>
              </th>

              <th className="py-2.5 px-2 w-20">Blocked</th>
              <th className="py-2.5 px-2 w-24">Pending</th>
              <th className="py-2.5 px-2 w-28">PC</th>
              <th className="py-2.5 px-2 w-28">PS5</th>
              <th className="py-2.5 px-2 w-28">XSX</th>
              <th className="py-2.5 px-2 w-28">Switch 2</th>

              {/* Status column with sort */}
              <th
                onClick={() => onSortChange('status')}
                className="py-2.5 px-2 w-28 cursor-pointer group/th hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              <th className="py-2.5 px-2 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {tickets.map((t) => {
              const isSelected = selectedTicketIds.includes(t.id);
              const platformsLeft = calculatePlatformsLeft(t);

              return (
                <tr
                  key={t.id}
                  className={`group transition-colors hover:bg-slate-800/40 ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(t.id)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Bug ID with link to Jira */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <a
                      href={sanitizeUrl(`${jiraBaseUrl}${t.bugId}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      {t.bugId}
                      <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  </td>

                  {/* Summary & Triage Category */}
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-0.5 max-w-md">
                      <span className="text-slate-200 font-medium leading-snug line-clamp-2">
                        {t.summary}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono text-indigo-400/90">{t.bugType}</span>
                        {t.assignedTester && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="text-amber-400/90 font-medium">Assigned: {t.assignedTester}</span>
                          </>
                        )}
                        {t.comment && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="truncate italic text-slate-400">{t.comment}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <select
                      value={t.priority}
                      onChange={(e) => handlePriorityChange(t, e.target.value as Priority)}
                      className={`bg-transparent text-xs focus:outline-none cursor-pointer border-none p-0 ${getPriorityColor(
                        t.priority
                      )}`}
                    >
                      <option value="Critical" className="bg-slate-900 text-rose-400">Critical</option>
                      <option value="Highest" className="bg-slate-900 text-rose-300">Highest</option>
                      <option value="High" className="bg-slate-900 text-amber-300">High</option>
                      <option value="Medium" className="bg-slate-900 text-slate-300">Medium</option>
                      <option value="Low" className="bg-slate-900 text-slate-400">Low</option>
                      <option value="Lowest" className="bg-slate-900 text-slate-400">Lowest</option>
                    </select>
                  </td>

                  {/* Blocked by (Auto-linked) */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    {t.blockedBy ? (
                      <a
                        href={sanitizeUrl(`${jiraBaseUrl}${t.blockedBy}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-purple-400 hover:underline text-[11px]"
                      >
                        {t.blockedBy}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Platforms Left (Formula Output) */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        platformsLeft ? 'text-amber-300 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {platformsLeft || 'None'}
                    </span>
                  </td>

                  {/* PC Status & Build */}
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <select
                        value={t.pcStatus}
                        onChange={(e) => handlePlatformChange(t, 'pc', e.target.value as PlatformStatus)}
                        className={`text-[11px] rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${getPlatformStatusStyle(
                          t.pcStatus
                        )}`}
                      >
                        <option value="To Test" className="bg-slate-900 text-indigo-300">To Test</option>
                        <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                        <option value="Fixed" className="bg-slate-900 text-emerald-300">Fixed</option>
                        <option value="Occurs" className="bg-slate-900 text-rose-300">Occurs</option>
                        <option value="Blocked" className="bg-slate-900 text-purple-300">Blocked</option>
                        <option value="N/A" className="bg-slate-900 text-slate-500">N/A</option>
                        <option value="Done" className="bg-slate-900 text-emerald-400">Done</option>
                      </select>
                      {t.pcBuild && (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={t.pcBuild}>
                          {t.pcBuild}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PS5 Status & Build */}
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <select
                        value={t.ps5Status}
                        onChange={(e) => handlePlatformChange(t, 'ps5', e.target.value as PlatformStatus)}
                        className={`text-[11px] rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${getPlatformStatusStyle(
                          t.ps5Status
                        )}`}
                      >
                        <option value="To Test" className="bg-slate-900 text-indigo-300">To Test</option>
                        <option value="Any Console" className="bg-slate-900 text-sky-300">Any Console</option>
                        <option value="PS5 or XSX" className="bg-slate-900 text-sky-300">PS5 or XSX</option>
                        <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                        <option value="Fixed" className="bg-slate-900 text-emerald-300">Fixed</option>
                        <option value="Occurs" className="bg-slate-900 text-rose-300">Occurs</option>
                        <option value="Blocked" className="bg-slate-900 text-purple-300">Blocked</option>
                        <option value="N/A" className="bg-slate-900 text-slate-500">N/A</option>
                        <option value="Done" className="bg-slate-900 text-emerald-400">Done</option>
                      </select>
                      {t.ps5Build && (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={t.ps5Build}>
                          {t.ps5Build}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* XSX Status & Build */}
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <select
                        value={t.xsxStatus}
                        onChange={(e) => handlePlatformChange(t, 'xsx', e.target.value as PlatformStatus)}
                        className={`text-[11px] rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${getPlatformStatusStyle(
                          t.xsxStatus
                        )}`}
                      >
                        <option value="To Test" className="bg-slate-900 text-indigo-300">To Test</option>
                        <option value="Any Console" className="bg-slate-900 text-sky-300">Any Console</option>
                        <option value="PS5 or XSX" className="bg-slate-900 text-sky-300">PS5 or XSX</option>
                        <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                        <option value="Fixed" className="bg-slate-900 text-emerald-300">Fixed</option>
                        <option value="Occurs" className="bg-slate-900 text-rose-300">Occurs</option>
                        <option value="Blocked" className="bg-slate-900 text-purple-300">Blocked</option>
                        <option value="N/A" className="bg-slate-900 text-slate-500">N/A</option>
                        <option value="Done" className="bg-slate-900 text-emerald-400">Done</option>
                      </select>
                      {t.xsxBuild && (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={t.xsxBuild}>
                          {t.xsxBuild}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Switch 2 Status & Build */}
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1">
                      <select
                        value={t.switch2Status}
                        onChange={(e) => handlePlatformChange(t, 'switch2', e.target.value as PlatformStatus)}
                        className={`text-[11px] rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${getPlatformStatusStyle(
                          t.switch2Status
                        )}`}
                      >
                        <option value="To Test" className="bg-slate-900 text-indigo-300">To Test</option>
                        <option value="Any Console" className="bg-slate-900 text-sky-300">Any Console</option>
                        <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                        <option value="Fixed" className="bg-slate-900 text-emerald-300">Fixed</option>
                        <option value="Occurs" className="bg-slate-900 text-rose-300">Occurs</option>
                        <option value="Blocked" className="bg-slate-900 text-purple-300">Blocked</option>
                        <option value="N/A" className="bg-slate-900 text-slate-500">N/A</option>
                        <option value="Done" className="bg-slate-900 text-emerald-400">Done</option>
                      </select>
                      {t.switch2Build && (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={t.switch2Build}>
                          {t.switch2Build}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Overall Status */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <select
                        value={t.status}
                        onChange={(e) => handleOverallStatusChange(t, e.target.value as OverallStatus)}
                        className={`text-xs rounded px-2 py-1 border cursor-pointer focus:outline-none ${getOverallStatusStyle(
                          t.status
                        )}`}
                      >
                        <option value="To Test" className="bg-slate-900 text-slate-300">To Test</option>
                        <option value="In Progress" className="bg-slate-900 text-amber-300">In Progress</option>
                        <option value="To Be Reviewed" className="bg-slate-900 text-emerald-300">To Be Reviewed</option>
                        <option value="Blocked" className="bg-slate-900 text-purple-300">Blocked</option>
                        <option value="Done" className="bg-slate-900 text-slate-400">Done</option>
                        <option value="Sent Back" className="bg-slate-900 text-rose-300">Sent Back</option>
                      </select>
                      {t.dateStamped && (
                        <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                          {t.dateStamped.slice(5, 16)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quick Row Actions */}
                  <td className="py-2 px-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenJiraComment(t)}
                        title="Generate Jira Comment"
                        className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTicket(t.id)}
                        title="Delete Ticket"
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
