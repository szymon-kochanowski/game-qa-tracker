import React, { useState } from 'react';
import { X, Copy, Check, Filter } from 'lucide-react';
import { BugTicket } from '../../types';

interface JqlModalProps {
  tickets: BugTicket[];
  tabName: string;
  onClose: () => void;
}

export const JqlModal: React.FC<JqlModalProps> = ({ tickets, tabName, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Scans for tickets marked "To Be Reviewed"
  const reviewBugs = tickets.filter((t) => t.status === 'To Be Reviewed');
  const bugIds = reviewBugs.map((t) => t.bugId);

  const jqlQuery =
    bugIds.length > 0
      ? `key in (${bugIds.join(', ')})`
      : 'No bugs currently marked as "To Be Reviewed".';

  const handleCopy = () => {
    if (bugIds.length === 0) return;
    navigator.clipboard.writeText(jqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">
              Generate JQL for Review ({tabName})
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
          <p className="text-xs text-slate-400 mb-3">
            Copy the JQL string below and paste it into Jira&apos;s search bar to bulk-edit and close all verified bugs.
          </p>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
              Jira Query Language (JQL)
            </div>
            <textarea
              readOnly
              rows={3}
              value={jqlQuery}
              className="w-full bg-transparent text-sm font-mono text-indigo-300 focus:outline-none resize-none"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              Total tickets ready for sign-off:{' '}
              <span className="font-semibold text-slate-200">{bugIds.length}</span>
            </span>
            {bugIds.length > 0 && (
              <span className="text-emerald-400 font-medium">Ready for bulk-close</span>
            )}
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
            disabled={bugIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Copied JQL
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy JQL Query
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
