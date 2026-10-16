import { AppData, GoogleSheetsConfig } from '../types';

/**
 * Production-ready Google Apps Script backend for Google Sheets.
 * Allows Google Sheets to function as an authoritative REST API database.
 * Paste in: Extensions > Apps Script in Google Sheets.
 * Deploy as: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Sheets Database Bridge & Web App API for Game QA Regression Tracker
 * Author: Szymon Kochanowski
 *
 * Provides atomic read/write synchronization with Google Sheets using LockService.
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = { status: 'success', data: {} };

  // Read all regression tabs (tabs matching 'regre')
  var sheets = ss.getSheets();
  var tabs = [];

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sName = sheet.getName();

    if (sName.toLowerCase().indexOf('regre') > -1) {
      var data = sheet.getDataRange().getValues();
      var tickets = [];

      // Row index 1 is header (0-indexed). Data starts at row index 1 or 2 depending on schema.
      for (var r = 1; r < data.length; r++) {
        var row = data[r];
        if (!row[1] || String(row[1]).trim() === '' || String(row[1]).indexOf('Bug ID') > -1) continue;

        tickets.push({
          id: 'gs_' + r + '_' + String(row[1]),
          bugId: String(row[1]).trim().toUpperCase(),
          summary: String(row[2] || ''),
          priority: String(row[3] || 'Medium'),
          bugType: String(row[4] || 'Gameplay'),
          blockedBy: String(row[5] || ''),
          comment: String(row[6] || ''),
          pcStatus: String(row[8] || 'To Test'),
          pcBuild: String(row[9] || ''),
          ps5Status: String(row[10] || 'To Test'),
          ps5Build: String(row[11] || ''),
          xsxStatus: String(row[12] || 'To Test'),
          xsxBuild: String(row[13] || ''),
          switch2Status: String(row[14] || 'To Test'),
          switch2Build: String(row[15] || ''),
          status: String(row[16] || 'To Test'),
          dateStamped: row[17] ? String(row[17]) : '',
          sortHelper: Number(row[18]) || 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      tabs.push({
        id: 'tab_' + sName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: sName,
        tickets: tickets,
        createdAt: new Date().toISOString()
      });
    }
  }

  result.data.tabs = tabs;
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent write operations to complete
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Failed to acquire script lock (concurrency limit): ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.action === 'syncAll' && payload.tabs) {
      for (var t = 0; t < payload.tabs.length; t++) {
        var tabData = payload.tabs[t];
        var sheet = ss.getSheetByName(tabData.name);

        if (!sheet) {
          sheet = ss.insertSheet(tabData.name);
          var defaultHeaders = [
            'Jira link', 'Bug ID', 'Summary', 'Priority', 'Bug Type',
            'Blocked by', 'Comment', 'Platforms left', 'PC', 'PC Build Number',
            'PS5', 'PS5 Build Number', 'XSX', 'XSX Build Number', 'Switch 2',
            'Switch Build Number', 'Status', 'Date', 'Sort Helper'
          ];
          sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
        }

        // Clear existing data rows starting from row 2
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, 19).clearContent();
        }

        // Prepare ticket rows
        if (tabData.tickets && tabData.tickets.length > 0) {
          var rows = [];
          for (var i = 0; i < tabData.tickets.length; i++) {
            var item = tabData.tickets[i];
            rows.push([
              item.bugId ? 'https://company.atlassian.net/browse/' + item.bugId : '',
              item.bugId || '',
              item.summary || '',
              item.priority || 'Medium',
              item.bugType || 'Gameplay',
              item.blockedBy || '',
              item.comment || '',
              '', // Platforms left
              item.pcStatus || 'To Test',
              item.pcBuild || '',
              item.ps5Status || 'To Test',
              item.ps5Build || '',
              item.xsxStatus || 'To Test',
              item.xsxBuild || '',
              item.switch2Status || 'To Test',
              item.switch2Build || '',
              item.status || 'To Test',
              item.dateStamped || '',
              item.sortHelper || 0
            ]);
          }
          sheet.getRange(2, 1, rows.length, 19).setValues(rows);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Simulated REST sync with Google Apps Script endpoint'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

export interface SyncResult {
  success: boolean;
  message: string;
  syncedAt?: string;
  data?: Partial<AppData>;
}

/**
 * Pushes application state to the configured Google Sheets Apps Script endpoint.
 * In local demonstration mode (when webAppUrl is empty), simulates an 800ms HTTP request.
 */
export async function pushToGoogleSheets(
  config: GoogleSheetsConfig,
  appData: AppData
): Promise<SyncResult> {
  // Local demonstration mode (Mock Cloud Bridge)
  if (!config.webAppUrl || !config.webAppUrl.trim()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nowStr = new Date().toLocaleTimeString();
    return {
      success: true,
      message: 'Simulated REST sync with Google Apps Script endpoint',
      syncedAt: nowStr,
    };
  }

  try {
    const payload = {
      action: 'syncAll',
      timestamp: new Date().toISOString(),
      tabs: appData.tabs,
      builds: appData.builds,
      dailyTasks: appData.dailyTasks,
      taskHours: appData.taskHours,
    };

    const response = await fetch(config.webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      message: json.message || 'Simulated REST sync with Google Apps Script endpoint',
      syncedAt: new Date().toLocaleTimeString(),
    };
  } catch (err: any) {
    console.warn('Google Sheets push warning:', err);
    return {
      success: false,
      message: `Failed to push to Google Sheets: ${err.message || 'Check Web App URL and permissions.'}`,
    };
  }
}

/**
 * Pulls latest data from the configured Google Sheets Apps Script endpoint.
 * In local demonstration mode (when webAppUrl is empty), simulates an 800ms HTTP request.
 */
export async function pullFromGoogleSheets(config: GoogleSheetsConfig): Promise<SyncResult> {
  // Local demonstration mode (Mock Cloud Bridge)
  if (!config.webAppUrl || !config.webAppUrl.trim()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nowStr = new Date().toLocaleTimeString();
    return {
      success: true,
      message: 'Simulated REST sync with Google Apps Script endpoint',
      syncedAt: nowStr,
    };
  }

  try {
    const response = await fetch(`${config.webAppUrl}?action=pull&t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.status !== 'success' || !json.data) {
      throw new Error(json.message || 'Invalid response from Google Sheets');
    }

    return {
      success: true,
      message: json.message || 'Simulated REST sync with Google Apps Script endpoint',
      syncedAt: new Date().toLocaleTimeString(),
      data: json.data,
    };
  } catch (err: any) {
    console.warn('Google Sheets pull warning:', err);
    return {
      success: false,
      message: `Failed to pull from Google Sheets: ${err.message || 'Check Web App URL and deployment.'}`,
    };
  }
}
