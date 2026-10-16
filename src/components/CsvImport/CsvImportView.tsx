import React, { useState } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  Play,
  FileSpreadsheet,
} from 'lucide-react';
import { RegreTab, BugTicket } from '../../types';
import { processJiraCsvImport, ParseResult } from '../../services/csvParser';

interface CsvImportViewProps {
  tabs: RegreTab[];
  activeTabId: string;
  onImportComplete: (
    targetTabId: string,
    added: BugTicket[],
    updated: { bugId: string; summary: string; priority: any }[]
  ) => void;
}

const SAMPLE_JIRA_CSV = `Issue key,Summary,Priority,Status,Blocked by
BUG-1102,"Crash when reloading rocket launcher while swimming in sunken temple",Critical,Open,
BUG-1105,"Japanese character kanji rendering clipped on inventory tooltips",Medium,Open,
BUG-1109,"Player character collision clipping through elevator floor on level 6",High,Open,BUG-1024
BUG-1114,"Audio voice dialogue distortion on 5.1 surround sound configurations",High,Open,
BUG-1120,"HDR peak brightness slider resets when toggling fullscreen mode",Medium,Open,
BUG-1128,"Achievement Deep Diver does not unlock after finding all 10 artifacts",Low,Open,
BUG-1135,"Texture pop-in and shimmering on distant pine trees in alpine zone",High,Open,
BUG-1024,"Crash when opening weapon wheel during boss phase 2 transformation",Critical,Open,`;

export const CsvImportView: React.FC<CsvImportViewProps> = ({
  tabs,
  activeTabId,
  onImportComplete,
}) => {
  const [targetTabId, setTargetTabId] = useState(activeTabId);
  const [csvContent, setCsvContent] = useState('');
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const targetTab = tabs.find((t) => t.id === targetTabId) || tabs[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      runPreview(text, targetTabId);
    };
    reader.readAsText(file);
  };

  const runPreview = (text: string, tabId: string) => {
    if (!text.trim()) {
      setPreviewResult(null);
      return;
    }
    const res = processJiraCsvImport(text, tabId, tabs);
    setPreviewResult(res);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvContent(text);
    runPreview(text, targetTabId);
  };

  const handleLoadSample = () => {
    setCsvContent(SAMPLE_JIRA_CSV);
    runPreview(SAMPLE_JIRA_CSV, targetTabId);
  };

  const handleExecuteImport = () => {
    if (!previewResult || (previewResult.added.length === 0 && previewResult.updated.length === 0)) {
      alert('No valid bug rows found to import.');
      return;
    }
    onImportComplete(targetTabId, previewResult.added, previewResult.updated);
    setImportStatus(
      `Ingestion Complete! Added ${previewResult.added.length} new bug(s), updated ${previewResult.updated.length} existing bug(s) in "${targetTab.name}".`
    );
    setCsvContent('');
    setPreviewResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-400" />
          Jira CSV Ingestion Engine
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest raw Jira regression exports. Automatically triages bug types, checks cross-sprint
          duplicates, updates existing tickets, and appends new records.
        </p>
      </div>

      {importStatus && (
        <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-4 text-xs font-medium text-emerald-300 flex items-center justify-between">
          <span>{importStatus}</span>
          <button
            onClick={() => setImportStatus('')}
            className="text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Target Tab Selection */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-200">
            1. Select Target Regression Tab
          </label>
          <select
            value={targetTabId}
            onChange={(e) => {
              setTargetTabId(e.target.value);
              if (csvContent) runPreview(csvContent, e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name} ({tab.tickets.length} tickets)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Tickets existing in other tabs will be flagged as duplicates to avoid multi-sprint collision.
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">Quick Options</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950 text-indigo-300 hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Load Sample Jira CSV
            </button>
            <label className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 transition-colors">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Upload .CSV File
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* CSV Drop Input Area */}
        <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              2. Paste Raw Jira CSV Data (or comma-separated values)
            </label>
            {csvContent && (
              <button
                onClick={() => {
                  setCsvContent('');
                  setPreviewResult(null);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={10}
            value={csvContent}
            onChange={handleTextChange}
            placeholder={`Paste your exported Jira CSV here (Issue key, Summary, Priority, etc.)...\n\nExample:\nIssue key,Summary,Priority\nBUG-1050,"Memory leak on boss fight",Critical`}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed selection:bg-indigo-500/30"
          />
        </div>
      </div>

      {/* Ingestion Preview & Duplicate Warning */}
      {previewResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-100">
                Ingestion Analysis Preview
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400 font-medium">
                  +{previewResult.added.length} New Tickets
                </span>
                <span className="text-amber-400 font-medium">
                  ↺ {previewResult.updated.length} To Update
                </span>
                {previewResult.skippedCrossTab.length > 0 && (
                  <span className="text-rose-400 font-medium">
                    ⚠ {previewResult.skippedCrossTab.length} Skipped Duplicates
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Execute Ingestion into {targetTab.name}
            </button>
          </div>

          {/* Cross-Tab duplicate warnings */}
          {previewResult.skippedCrossTab.length > 0 && (
            <div className="rounded-lg bg-rose-950/20 border border-rose-900/50 p-3 text-xs text-rose-300 space-y-1">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Cross-Sprint Duplicate Warning:
              </span>
              <p className="text-rose-300/80">
                The following tickets already exist in other regression queues and will be skipped:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {previewResult.skippedCrossTab.map((d, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-rose-200"
                  >
                    {d.bugId} (in {d.existingTabName})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Table Preview of Added/Updated bugs */}
          <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-500 text-[10px] uppercase font-semibold">
                  <th className="p-2 w-28">Bug ID</th>
                  <th className="p-2">Summary</th>
                  <th className="p-2 w-20">Priority</th>
                  <th className="p-2 w-24">Auto Bug Type</th>
                  <th className="p-2 w-24">Platform Targets</th>
                  <th className="p-2 w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-sans">
                {previewResult.added.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40">
                    <td className="p-2 font-mono font-bold text-indigo-400">{t.bugId}</td>
                    <td className="p-2 text-slate-200 truncate max-w-sm">{t.summary}</td>
                    <td className="p-2 text-slate-300">{t.priority}</td>
                    <td className="p-2 font-mono text-slate-400">{t.bugType}</td>
                    <td className="p-2 font-mono text-[11px] text-slate-400">
                      {t.pcStatus}, {t.ps5Status}
                    </td>
                    <td className="p-2 text-emerald-400 font-semibold text-[11px]">Append New</td>
                  </tr>
                ))}
                {previewResult.updated.map((u, i) => (
                  <tr key={`u_${i}`} className="hover:bg-slate-900/40 opacity-80">
                    <td className="p-2 font-mono font-bold text-amber-400">{u.bugId}</td>
                    <td className="p-2 text-slate-300 truncate max-w-sm">{u.summary}</td>
                    <td className="p-2 text-slate-400">{u.priority}</td>
                    <td className="p-2 text-slate-500">—</td>
                    <td className="p-2 text-slate-500">Preserved</td>
                    <td className="p-2 text-amber-400 font-semibold text-[11px]">Update Info</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
