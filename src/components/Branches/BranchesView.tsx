import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Lock,
  Check,
} from 'lucide-react';
import { BranchBuild, GamingPlatform } from '../../types';
import { getTodayDateString } from '../../services/storage';

interface BranchesViewProps {
  builds: BranchBuild[];
  onUpdateBuilds: (builds: BranchBuild[]) => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({ builds, onUpdateBuilds }) => {
  const [isAdding, setIsAdding] = useState(false);
  const todayStr = getTodayDateString();

  const [platform, setPlatform] = useState<GamingPlatform>('PC');
  const [branchName, setBranchName] = useState('');
  const [currentBuildName, setCurrentBuildName] = useState('');
  const [buildPath, setBuildPath] = useState('');
  const [steamPassword, setSteamPassword] = useState('');
  const [comment, setComment] = useState('');

  const handleAddBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !currentBuildName.trim()) return;

    const newBuild: BranchBuild = {
      id: `build_${Date.now()}`,
      platform,
      branchName: branchName.trim(),
      useDate: todayStr,
      receivedDate: todayStr,
      currentBuildName: currentBuildName.trim(),
      buildPath: buildPath.trim() || 'Internal DevKit Share',
      steamPassword: steamPassword.trim() || undefined,
      inUseToday: true,
      comment: comment.trim() || undefined,
    };

    onUpdateBuilds([...builds, newBuild]);
    setBranchName('');
    setCurrentBuildName('');
    setBuildPath('');
    setSteamPassword('');
    setComment('');
    setIsAdding(false);
  };

  const handleToggleToday = (buildId: string) => {
    const updated = builds.map((b) => {
      if (b.id === buildId) {
        const nextInUse = !b.inUseToday;
        return {
          ...b,
          inUseToday: nextInUse,
          useDate: nextInUse ? todayStr : b.useDate,
        };
      }
      return b;
    });
    onUpdateBuilds(updated);
  };

  const handleDeleteBuild = (buildId: string) => {
    if (window.confirm('Delete this build registration?')) {
      onUpdateBuilds(builds.filter((b) => b.id !== buildId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Branches and Builds Registry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active game build packages across console DevKits and PC Steam branches.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Build</span>
        </button>
      </div>

      {/* Add Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddBuild}
          className="p-5 rounded-xl border border-indigo-900/60 bg-indigo-950/20 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40">
            <span className="font-semibold text-indigo-200">Register New Game Build</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as GamingPlatform)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="PC">PC</option>
                <option value="PS5">PS5</option>
                <option value="XSX">XSX</option>
                <option value="Switch 2">Switch 2</option>
                <option value="XPA">XPA</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Branch Name *</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. release/1.2.0-rc"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-300 mb-1 font-medium">Current Build Identifier *</label>
              <input
                type="text"
                required
                value={currentBuildName}
                onChange={(e) => setCurrentBuildName(e.target.value)}
                placeholder="e.g. Build_1.2.0_b8492_D3D12"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-300 mb-1 font-medium">Build Path / DevKit Location</label>
              <input
                type="text"
                value={buildPath}
                onChange={(e) => setBuildPath(e.target.value)}
                placeholder="\\nas-qa\builds\pc\1.2.0\ or Title ID..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Branch Password (Steam)</label>
              <input
                type="text"
                value={steamPassword}
                onChange={(e) => setSteamPassword(e.target.value)}
                placeholder="Password if locked..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Notes / Release Info</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Gold candidate with hotfixed memory leak"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Save to Registry
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-3 w-24">Platform</th>
                <th className="py-3 px-3 w-44">Branch Name</th>
                <th className="py-3 px-3 min-w-[200px]">Current Build Name</th>
                <th className="py-3 px-3 min-w-[220px]">Build Path / DevKit Location</th>
                <th className="py-3 px-3 w-28 text-center">In Use Today?</th>
                <th className="py-3 px-3 w-28">Use Date</th>
                <th className="py-3 px-3 w-36">Steam Password</th>
                <th className="py-3 px-3 min-w-[160px]">Comment</th>
                <th className="py-3 px-3 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {builds.map((b) => {
                const isToday = b.useDate === todayStr || b.inUseToday;
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isToday ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    {/* Platform */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                        {b.platform}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-300">
                      {b.branchName}
                    </td>

                    {/* Build Name */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <span className="text-indigo-300 font-semibold bg-indigo-950/50 border border-indigo-900/60 px-2 py-0.5 rounded">
                        {b.currentBuildName}
                      </span>
                    </td>

                    {/* Build Path */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[240px]" title={b.buildPath}>
                      {b.buildPath}
                    </td>

                    {/* In Use Today (Toggle chip) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleToday(b.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          isToday
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {isToday ? (
                          <>
                            <Check className="w-3 h-3" /> Yes
                          </>
                        ) : (
                          'No'
                        )}
                      </button>
                    </td>

                    {/* Use Date */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {b.useDate || '—'}
                    </td>

                    {/* Steam Password */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {b.steamPassword ? (
                        <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          {b.steamPassword}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Comment */}
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {b.comment || '—'}
                    </td>

                    {/* Delete */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteBuild(b.id)}
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
    </div>
  );
};
