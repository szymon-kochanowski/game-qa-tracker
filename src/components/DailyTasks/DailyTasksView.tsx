import React, { useState } from 'react';
import {
  Users,
  Send,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { DailyAssignment, BranchBuild, GamingPlatform, UserAccount } from '../../types';
import { sanitizeUrl } from '../../services/security';

interface DailyTasksViewProps {
  assignments: DailyAssignment[];
  builds: BranchBuild[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  onUpdateAssignments: (updated: DailyAssignment[]) => void;
  onOpenPublishModal: () => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  assignments,
  builds,
  users,
  currentUser,
  onUpdateAssignments,
  onOpenPublishModal,
}) => {
  const [newTester, setNewTester] = useState(users[0]?.displayName || 'Unassigned');
  const [newTask, setNewTask] = useState('');
  const [newPlatform, setNewPlatform] = useState<GamingPlatform | 'Multi'>('PC');
  const [newBranch, setNewBranch] = useState(builds[0]?.branchName || '');
  const [newTaskUrl, setNewTaskUrl] = useState('');

  // Helper to resolve build metadata from branch name (matching XLOOKUP in Google Sheets)
  const resolveBuildForBranch = (branchName: string) => {
    return builds.find((b) => b.branchName === branchName);
  };

  const handleBranchChange = (assignmentId: string, branchName: string) => {
    const match = resolveBuildForBranch(branchName);
    const updated = assignments.map((a) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          branch: branchName,
          buildVersion: match?.currentBuildName || 'Not found',
          buildLocation: match?.buildPath || '',
        };
      }
      return a;
    });
    onUpdateAssignments(updated);
  };

  const handleFieldChange = (
    assignmentId: string,
    field: keyof DailyAssignment,
    value: string
  ) => {
    const updated = assignments.map((a) => {
      if (a.id === assignmentId) {
        return { ...a, [field]: value };
      }
      return a;
    });
    onUpdateAssignments(updated);
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const matchedBuild = resolveBuildForBranch(newBranch);
    const newRow: DailyAssignment = {
      id: `task_${Date.now()}`,
      tester: newTester.trim(),
      task: newTask.trim(),
      platform: newPlatform,
      branch: newBranch,
      buildVersion: matchedBuild?.currentBuildName || 'Not found',
      buildLocation: matchedBuild?.buildPath || '',
      taskUrl: newTaskUrl.trim() || undefined,
    };

    onUpdateAssignments([...assignments, newRow]);
    setNewTask('');
    setNewTaskUrl('');
  };

  const handleDeleteAssignment = (id: string) => {
    onUpdateAssignments(assignments.filter((a) => a.id !== id));
  };

  const handleResetTasks = () => {
    if (
      window.confirm(
        'Reset daily tasks for a new testing day? (Clears tester assignments while keeping row scaffolding)'
      )
    ) {
      const reset = assignments.map((a) => ({
        ...a,
        tester: 'Unassigned',
        task: '',
        notes: '',
      }));
      onUpdateAssignments(reset);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Daily Tasks & QA Assignment Board
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Assign team focus areas using the team roster dropdown. Build versions auto-resolve dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetTasks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Daily Tasks</span>
          </button>
          <button
            onClick={onOpenPublishModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Assignments</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-3 w-48">Assigned Tester</th>
                <th className="py-3 px-3 min-w-[260px]">Task Description</th>
                <th className="py-3 px-3 w-28">Platform</th>
                <th className="py-3 px-3 w-40">Branch (Lookup Key)</th>
                <th className="py-3 px-3 w-44">Build Version (Auto)</th>
                <th className="py-3 px-3 min-w-[180px]">Location / Path</th>
                <th className="py-3 px-3 w-28">Task URL</th>
                <th className="py-3 px-3 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {assignments.map((a) => {
                const isUnassigned = a.tester.trim().toLowerCase() === 'unassigned' || !a.tester.trim();
                const isCurrentTester = currentUser && a.tester.toLowerCase().includes(currentUser.displayName.toLowerCase());

                return (
                  <tr
                    key={a.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrentTester ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Tester Dropdown List */}
                    <td className="py-2.5 px-3">
                      <select
                        value={a.tester}
                        onChange={(e) => handleFieldChange(a.id, 'tester', e.target.value)}
                        className={`w-full bg-slate-950 border rounded px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500 ${
                          isUnassigned
                            ? 'text-slate-500 border-slate-800'
                            : 'text-indigo-300 font-semibold border-indigo-900/60'
                        }`}
                      >
                        <option value="Unassigned" className="bg-slate-900 text-slate-500">
                          — Unassigned —
                        </option>
                        {users.map((u) => (
                          <option key={u.id} value={u.displayName} className="bg-slate-900 text-slate-200">
                            {u.displayName} ({u.role})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Task Description */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={a.task}
                        onChange={(e) => handleFieldChange(a.id, 'task', e.target.value)}
                        placeholder="Task focus area..."
                        className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </td>

                    {/* Platform */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <select
                        value={a.platform}
                        onChange={(e) => handleFieldChange(a.id, 'platform', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PC">PC</option>
                        <option value="PS5">PS5</option>
                        <option value="XSX">XSX</option>
                        <option value="Switch 2">Switch 2</option>
                        <option value="Multi">Multi</option>
                      </select>
                    </td>

                    {/* Branch (Trigger for lookup) */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <select
                        value={a.branch}
                        onChange={(e) => handleBranchChange(a.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        {builds.map((b) => (
                          <option key={b.id} value={b.branchName}>
                            {b.branchName} ({b.platform})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Resolved Build Version */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <span className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded block truncate">
                        {a.buildVersion || 'Not found'}
                      </span>
                    </td>

                    {/* Resolved Location */}
                    <td
                      className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[200px]"
                      title={a.buildLocation}
                    >
                      {a.buildLocation || '—'}
                    </td>

                    {/* Task URL */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {a.taskUrl ? (
                        <a
                          href={sanitizeUrl(a.taskUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                        >
                          Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <input
                          type="text"
                          placeholder="Jira link..."
                          value={a.taskUrl || ''}
                          onChange={(e) => handleFieldChange(a.id, 'taskUrl', e.target.value)}
                          className="w-24 bg-transparent border-b border-slate-800 text-[11px] text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </td>

                    {/* Delete row */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Form with Tester Dropdown */}
      <form
        onSubmit={handleAddAssignment}
        className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center gap-3 text-xs"
      >
        <span className="font-semibold text-slate-200 shrink-0">Quick Add Assignment:</span>

        {/* Tester Dropdown */}
        <select
          value={newTester}
          onChange={(e) => setNewTester(e.target.value)}
          className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500 w-44"
        >
          <option value="Unassigned">— Unassigned —</option>
          {users.map((u) => (
            <option key={u.id} value={u.displayName}>
              {u.displayName} ({u.role})
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task instructions..."
          className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 min-w-[200px]"
        />

        <select
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value as any)}
          className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="PC">PC</option>
          <option value="PS5">PS5</option>
          <option value="XSX">XSX</option>
          <option value="Switch 2">Switch 2</option>
          <option value="Multi">Multi</option>
        </select>

        <select
          value={newBranch}
          onChange={(e) => setNewBranch(e.target.value)}
          className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {builds.map((b) => (
            <option key={b.id} value={b.branchName}>
              {b.branchName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </form>
    </div>
  );
};
