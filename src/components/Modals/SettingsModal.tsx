import React, { useState } from 'react';
import { X, Settings, Download, Upload, RotateCcw } from 'lucide-react';
import { AppData, AppSettings } from '../../types';
import { getInitialAppState } from '../../services/storage';

interface SettingsModalProps {
  settings: AppSettings;
  fullData: AppData;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRestoreData: (restored: AppData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  fullData,
  onUpdateSettings,
  onRestoreData,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setStatusMsg('Settings saved successfully.');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_qa_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tabs && parsed.builds) {
          onRestoreData(parsed);
          setStatusMsg('Backup restored successfully!');
          setTimeout(() => setStatusMsg(''), 3000);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (window.confirm('Reset all queues, builds, and daily assignments to default studio demo data?')) {
      const demo = getInitialAppState();
      onRestoreData(demo);
      setStatusMsg('Reset to default studio demo data.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">Studio & Jira Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Studio / Team Name</label>
            <input
              type="text"
              value={formData.studioName}
              onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Jira Base URL (Prefix for ticket links)
            </label>
            <input
              type="text"
              value={formData.jiraBaseUrl}
              onChange={(e) => setFormData({ ...formData, jiraBaseUrl: e.target.value })}
              placeholder="https://company.atlassian.net/browse/"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default: <code className="text-slate-400">https://company.atlassian.net/browse/</code>
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-emerald-400 font-medium">{statusMsg}</span>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">Data Backup & Reset</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON Backup
            </button>
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-400" /> Restore JSON File
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
          <button
            type="button"
            onClick={handleResetToDemo}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg border border-rose-950/60 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Reset to Default Studio Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
