import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { BugTicket } from '../../types';
import { sanitizeUrl } from '../../services/security';

interface JiraCommentModalProps {
  ticket: BugTicket | null;
  jiraBaseUrl: string;
  onClose: () => void;
}

export const JiraCommentModal: React.FC<JiraCommentModalProps> = ({ ticket, jiraBaseUrl, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const blockedBy = ticket.blockedBy ? ticket.blockedBy.trim() : 'Unknown Ticket';
  const platforms = [
    { name: 'PC', stat: ticket.pcStatus, build: ticket.pcBuild },
    { name: 'PS5', stat: ticket.ps5Status, build: ticket.ps5Build },
    { name: 'XSX', stat: ticket.xsxStatus, build: ticket.xsxBuild },
    { name: 'Switch 2', stat: ticket.switch2Status, build: ticket.switch2Build },
  ];

  const commentLines: string[] = [];
  for (const p of platforms) {
    const stat = (p.stat || '').trim();
    const build = (p.build || '').trim() || 'Unspecified Build';
    if (stat === 'Occurs' || stat === 'Sent Back') {
      commentLines.push(`Issue still occurs on ${p.name} on build: ${build}.`);
    } else if (stat === 'Fixed' || stat === 'Done') {
      commentLines.push(`Issue does not occur on ${p.name} on build: ${build}.`);
    } else if (stat === 'Blocked') {
      commentLines.push(`Regression on ${p.name} build ${build} is blocked by ${blockedBy}.`);
    }
  }

  const generatedText =
    commentLines.length > 0
      ? commentLines.join('\n')
      : `Regression verification on ${ticket.bugId}:\nStatus: ${ticket.status}\nNo definitive verification notes logged yet.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-100">Copy Jira Comment</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
              {ticket.bugId}
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
          <p className="text-xs text-slate-400 mb-2">
            Auto-formatted verification comment matching Jira studio standard. Ready to paste directly into ticket.
          </p>
          <div className="relative">
            <textarea
              readOnly
              rows={5}
              value={generatedText}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 selection:bg-indigo-500/30"
            />
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Summary: {ticket.summary.slice(0, 48)}...</span>
            <a
              href={sanitizeUrl(`${jiraBaseUrl}${ticket.bugId}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
            >
              Open in Jira <ExternalLink className="w-3 h-3" />
            </a>
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
                <Check className="w-4 h-4 text-emerald-300" /> Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Jira Comment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
