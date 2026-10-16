import React, { useState } from 'react';
import { X, Copy, Check, BarChart3 } from 'lucide-react';
import { BugTicket } from '../../types';

interface DailyReportModalProps {
  tickets: BugTicket[];
  tabName: string;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ tickets, tabName, onClose }) => {
  const [copied, setCopied] = useState(false);

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const blockedCount = tickets.filter((t) => t.status === 'Blocked').length;
  const toBeReviewedCount = tickets.filter((t) => t.status === 'To Be Reviewed').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const toTestCount = tickets.filter((t) => t.status === 'To Test').length;

  const doneToday = tickets.filter(
    (t) => t.status === 'Done' && (t.dateStamped?.startsWith(todayDateStr) || t.updatedAt.startsWith(todayDateStr))
  ).length;

  const sentBackToday = tickets.filter(
    (t) => t.status === 'Sent Back' && (t.dateStamped?.startsWith(todayDateStr) || t.updatedAt.startsWith(todayDateStr))
  ).length;

  const totalTickets = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === 'Done' || t.status === 'To Be Reviewed').length;
  const completionRate = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

  const reportText = `📊 DAILY QA SUMMARY (${tabName})
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}

⛔ Currently Blocked: ${blockedCount}
↩️ Sent Back Today: ${sentBackToday}
✅ Marked Done Today: ${doneToday}
🔍 To Be Reviewed: ${toBeReviewedCount}
⏳ In Progress: ${inProgressCount}
📋 Queue Remaining (To Test): ${toTestCount}

📈 Sprint Progress: ${resolvedCount}/${totalTickets} resolved (${completionRate}%)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">
              Daily QA Summary Report
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Blocked</span>
              <span className="text-lg font-mono font-bold text-rose-400 tabular-nums">
                {blockedCount}
              </span>
            </div>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Sent Back</span>
              <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">
                {sentBackToday}
              </span>
            </div>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Done Today</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {doneToday}
              </span>
            </div>
          </div>

          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Slack / Teams / Discord Broadcast Format:
          </label>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <textarea
              readOnly
              rows={8}
              value={reportText}
              className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Copied Report
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Broadcast Summary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
