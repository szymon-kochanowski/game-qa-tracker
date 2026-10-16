import React, { useState } from 'react';
import { X, Copy, Check, Users } from 'lucide-react';
import { DailyAssignment } from '../../types';

interface PublishAssignmentsModalProps {
  assignments: DailyAssignment[];
  onClose: () => void;
}

export const PublishAssignmentsModal: React.FC<PublishAssignmentsModalProps> = ({
  assignments,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const activeAssignments = assignments.filter(
    (a) => a.tester && a.task && a.tester.trim().toLowerCase() !== 'unassigned'
  );

  let message = `🎯 *TODAY'S QA ASSIGNMENTS*\n\n`;
  if (activeAssignments.length === 0) {
    message += `No active tasks have been assigned yet today.`;
  } else {
    for (const a of activeAssignments) {
      const testersFormatted = a.tester
        .split(',')
        .map((name) => `@${name.trim()}`)
        .join(', ');
      const platformText = a.platform ? a.platform : 'All Platforms';
      const buildText = a.buildVersion && a.buildVersion !== 'Not found' ? a.buildVersion : 'TBD';
      message += `• ${testersFormatted} - ${a.task} (${platformText}) - Build: ${buildText}\n`;
      if (a.notes) {
        message += `   Note: ${a.notes}\n`;
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">
              Publish Daily Assignments
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
            Generates tagged Slack / Teams morning assignment message with{' '}
            <span className="font-mono text-indigo-300">@tester</span> tags and auto-resolved build versions.
          </p>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <textarea
              readOnly
              rows={9}
              value={message}
              className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total active team members assigned:{' '}
            <span className="font-semibold text-slate-300">{activeAssignments.length}</span>
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
            disabled={activeAssignments.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Copied Assignments
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Broadcast Text
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
