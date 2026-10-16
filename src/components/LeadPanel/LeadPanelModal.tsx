import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
  FileSpreadsheet,
  Save,
  Layers,
  Settings,
  Database,
  Download,
  Upload,
  Check,
  Copy,
} from 'lucide-react';
import {
  UserAccount,
  UserRole,
  GoogleSheetsConfig,
  AppSettings,
  RegreTab,
  AppData,
} from '../../types';
import {
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  pushToGoogleSheets,
  pullFromGoogleSheets,
} from '../../services/googleSheets';

interface LeadPanelModalProps {
  settings: AppSettings;
  tabs: RegreTab[];
  fullData: AppData;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onUpdateTabs: (newTabs: RegreTab[]) => void;
  onRestoreData: (data: AppData) => void;
  onClose: () => void;
}

export const LeadPanelModal: React.FC<LeadPanelModalProps> = ({
  settings,
  tabs,
  fullData,
  onUpdateSettings,
  onUpdateTabs,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sheets' | 'sprints' | 'system'>('users');
  const [users, setUsers] = useState<UserAccount[]>(settings.users || []);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    ...settings.googleSheets,
  });
  const [jiraUrl, setJiraUrl] = useState(settings.jiraBaseUrl);
  const [studioName, setStudioName] = useState(settings.studioName);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('tester');
  const [newPassword, setNewPassword] = useState('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Add new tester
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim() || !newPassword.trim()) return;
    if (users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Username already exists. Please choose a unique username.');
      return;
    }

    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      displayName: newDisplayName.trim(),
      role: newRole,
      password: newPassword.trim(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    onUpdateSettings({ ...settings, users: updated });
    setNewUsername('');
    setNewDisplayName('');
    setNewPassword('');
    setStatusMsg(`User "${newUser.displayName}" added successfully.`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last remaining user account.');
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (window.confirm(`Remove user "${target?.displayName}" from team roster?`)) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      onUpdateSettings({ ...settings, users: updated });
    }
  };

  const handleSaveSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      googleSheets: sheetsConfig,
      jiraBaseUrl: jiraUrl,
      studioName,
    };
    onUpdateSettings(updated);
    setStatusMsg('Settings & Google Sheets configuration saved.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handlePushToSheets = async () => {
    setIsSyncing(true);
    setSyncStatus('Pushing regression data to Google Sheets...');
    const res = await pushToGoogleSheets(sheetsConfig, fullData);
    setIsSyncing(false);
    setSyncStatus(res.message);
    if (res.syncedAt) {
      const updatedConfig = { ...sheetsConfig, lastSyncedAt: res.syncedAt };
      setSheetsConfig(updatedConfig);
      onUpdateSettings({ ...settings, googleSheets: updatedConfig });
    }
  };

  const handlePullFromSheets = async () => {
    setIsSyncing(true);
    setSyncStatus('Pulling latest data from Google Sheets...');
    const res = await pullFromGoogleSheets(sheetsConfig);
    setIsSyncing(false);
    setSyncStatus(res.message);
    if (res.syncedAt) {
      const updatedConfig = { ...sheetsConfig, lastSyncedAt: res.syncedAt };
      setSheetsConfig(updatedConfig);
      onUpdateSettings({ ...settings, googleSheets: updatedConfig });
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100">
                QA Lead Management & Operations Panel
              </span>
              <p className="text-xs text-slate-400">
                Team administration, user credentials, Google Sheets database bridge, and studio controls.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team & Testers Roster ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sheets'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Google Sheets Database Sync
          </button>
          <button
            onClick={() => setActiveTab('sprints')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sprints'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Sprints & Tab Management
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Jira & Studio Settings
          </button>
        </div>

        {statusMsg && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
            {statusMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 flex-1">
          {/* TAB 1: USERS & TESTERS ROSTER */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Add user form */}
              <form
                onSubmit={handleAddUser}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
              >
                <span className="font-semibold text-slate-200 block text-xs">
                  Register New Team Member / Tester
                </span>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="e.g. Morgan Vance"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Username (Login ID) *</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. morgan"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Role *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="tester">QA Tester</option>
                      <option value="deputy">Deputy Lead QA</option>
                      <option value="lead">Lead QA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Unique Password *</label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. pass123"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Team Member
                  </button>
                </div>
              </form>

              {/* Users table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Display Name</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Assigned Password</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {u.displayName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">@{u.username}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              u.role === 'lead'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                : u.role === 'deputy'
                                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                                : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60'
                            }`}
                          >
                            {u.role === 'lead'
                              ? 'Lead QA'
                              : u.role === 'deputy'
                              ? 'Deputy Lead'
                              : 'QA Tester'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-indigo-300">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            {u.password}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS DATABASE BRIDGE */}
          {activeTab === 'sheets' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/20 p-4 space-y-2">
                <span className="font-semibold text-indigo-200 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Google Sheets as the Primary Database
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  This application can connect directly to your Google Spreadsheet via a Google Apps Script
                  Web App API. In local demo mode, clicking Push or Pull simulates an 800ms REST request and updates the sync timestamp.
                </p>
              </div>

              {/* Sync Controls */}
              <form
                onSubmit={handleSaveSheetsConfig}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <label className="flex items-center gap-2 font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetsConfig.enabled}
                      onChange={(e) =>
                        setSheetsConfig({ ...sheetsConfig, enabled: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                    />
                    <span>Enable Live Google Sheets Sync</span>
                  </label>
                  {sheetsConfig.lastSyncedAt && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      Last synced: {sheetsConfig.lastSyncedAt}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px] font-medium">
                    Google Apps Script Web App URL (Endpoint)
                  </label>
                  <input
                    type="url"
                    value={sheetsConfig.webAppUrl}
                    onChange={(e) =>
                      setSheetsConfig({ ...sheetsConfig, webAppUrl: e.target.value })
                    }
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec (Leave blank for Mock Cloud Bridge)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to use the built-in 800ms Mock Cloud Bridge simulator, or provide your live Apps Script Web App URL.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px] font-medium">
                      Google Spreadsheet ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.spreadsheetId}
                      onChange={(e) =>
                        setSheetsConfig({ ...sheetsConfig, spreadsheetId: e.target.value })
                      }
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px] font-medium">
                      Active Tab Name
                    </label>
                    <input
                      type="text"
                      value={sheetsConfig.sheetTabName}
                      onChange={(e) =>
                        setSheetsConfig({ ...sheetsConfig, sheetTabName: e.target.value })
                      }
                      placeholder="Regre Sprint 14"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={handlePushToSheets}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Push to Google Sheet
                    </button>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={handlePullFromSheets}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Pull from Sheet
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Configuration
                  </button>
                </div>
              </form>

              {syncStatus && (
                <div className="p-3 rounded-lg bg-slate-950 border border-indigo-900/40 text-xs font-mono text-indigo-300">
                  {syncStatus}
                </div>
              )}

              {/* Ready-to-copy Apps Script Code Snippet */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block">
                      Google Apps Script Web App Template (LockService Concurrency Safe)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Paste this into your Google Spreadsheet under <code>Extensions &gt; Apps Script</code>:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Code!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Script Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 max-h-48 overflow-y-auto leading-relaxed">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SPRINTS & QUEUE MANAGEMENT */}
          {activeTab === 'sprints' && (
            <div className="space-y-4">
              <span className="font-semibold text-slate-200 block text-xs">
                Active Regression Sprints ({tabs.length})
              </span>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{tab.name}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {tab.tickets.length} tickets total • Created:{' '}
                        {tab.createdAt?.slice(0, 10) || 'Recently'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Wipe all tickets from "${tab.name}"? (Tab will remain empty)`
                            )
                          ) {
                            const updated = tabs.map((t) =>
                              t.id === tab.id ? { ...t, tickets: [] } : t
                            );
                            onUpdateTabs(updated);
                          }
                        }}
                        className="px-2.5 py-1 text-xs text-amber-300 bg-amber-950/30 border border-amber-900/40 rounded hover:bg-amber-900/40"
                      >
                        Clear Tickets
                      </button>
                      {tabs.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete tab "${tab.name}"?`)) {
                              onUpdateTabs(tabs.filter((t) => t.id !== tab.id));
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded hover:bg-rose-900/40"
                        >
                          Delete Tab
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM & JIRA CONFIG */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                    Studio / Organization Name
                  </label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px] font-medium">
                    Jira Base URL
                  </label>
                  <input
                    type="text"
                    value={jiraUrl}
                    onChange={(e) => setJiraUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings({
                      ...settings,
                      studioName,
                      jiraBaseUrl: jiraUrl,
                    });
                    setStatusMsg('Studio configurations updated.');
                    setTimeout(() => setStatusMsg(''), 3000);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Save System Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Lead Panel
          </button>
        </div>
      </div>
    </div>
  );
};
