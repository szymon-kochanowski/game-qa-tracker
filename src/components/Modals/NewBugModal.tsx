import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { BugTicket, BugType, Priority } from '../../types';
import { sanitizeText } from '../../services/security';
import {
  guessBugTypeFromSummary,
  getInitialPlatformTargets,
  calculateSortHelper,
} from '../../services/triage';

interface NewBugModalProps {
  onAddTicket: (ticket: BugTicket) => void;
  onClose: () => void;
}

export const NewBugModal: React.FC<NewBugModalProps> = ({ onAddTicket, onClose }) => {
  const [bugId, setBugId] = useState('');
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [bugType, setBugType] = useState<BugType>('Gameplay');
  const [blockedBy, setBlockedBy] = useState('');
  const [comment, setComment] = useState('');

  // Auto-detect bug type as summary changes
  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSummary(val);
    if (val.length > 3) {
      const detected = guessBugTypeFromSummary(val);
      setBugType(detected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    const cleanSummary = sanitizeText(summary);
    const cleanBugId = sanitizeText(bugId).toUpperCase();
    if (!cleanBugId || !cleanSummary) return;

    const platforms = getInitialPlatformTargets(bugType);
    const now = new Date().toISOString();

    const newTicket: BugTicket = {
      id: `manual_${Date.now()}`,
      bugId: cleanBugId,
      summary: cleanSummary,
      priority,
      bugType,
      blockedBy: blockedBy.trim() ? sanitizeText(blockedBy).toUpperCase() : undefined,
      comment: comment.trim() ? sanitizeText(comment) : undefined,
      pcStatus: platforms.pc,
      ps5Status: platforms.ps5,
      xsxStatus: platforms.xsx,
      switch2Status: platforms.switch2,
      status: 'To Test',
      sortHelper: calculateSortHelper(priority, 'To Test'),
      createdAt: now,
      updatedAt: now,
    };

    onAddTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">Add Regression Ticket</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bug ID / Jira Key *
              </label>
              <input
                type="text"
                required
                value={bugId}
                onChange={(e) => setBugId(e.target.value)}
                placeholder="BUG-1050"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-indigo-300 uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Critical">Critical</option>
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Bug Type</span>
                <Tag className="w-3 h-3 text-indigo-400" />
              </label>
              <select
                value={bugType}
                onChange={(e) => setBugType(e.target.value as BugType)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Gameplay">Gameplay</option>
                <option value="Stability">Stability</option>
                <option value="Visual">Visual</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Localization">Localization</option>
                <option value="Audio">Audio</option>
                <option value="Settings">Settings</option>
                <option value="Achievements">Achievements</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Summary / Bug Description *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={handleSummaryChange}
              placeholder="e.g. Memory leak during level streaming in Sector 5"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Auto-triage regex automatically infers platform targets based on bug category.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Blocked By (Optional)
              </label>
              <input
                type="text"
                value={blockedBy}
                onChange={(e) => setBlockedBy(e.target.value)}
                placeholder="e.g. BUG-920"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                QA Notes / Repro hint
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Test with 3 controllers attached"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Add Ticket to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
