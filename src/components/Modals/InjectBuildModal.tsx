import React, { useState } from 'react';
import { X, Layers, CheckCircle2 } from 'lucide-react';
import { BranchBuild, GamingPlatform } from '../../types';

interface InjectBuildModalProps {
  builds: BranchBuild[];
  selectedTicketIds: string[];
  allTicketCount: number;
  onApply: (platform: GamingPlatform, buildName: string) => void;
  onClose: () => void;
}

export const InjectBuildModal: React.FC<InjectBuildModalProps> = ({
  builds,
  selectedTicketIds,
  allTicketCount,
  onApply,
  onClose,
}) => {
  const [platform, setPlatform] = useState<GamingPlatform>('PC');
  const [selectedBuild, setSelectedBuild] = useState<string>('');

  const targetCount = selectedTicketIds.length > 0 ? selectedTicketIds.length : allTicketCount;
  const isSelectedBatch = selectedTicketIds.length > 0;

  // Filter available builds for the chosen platform
  const filteredBuilds = builds.filter(
    (b) => b.platform === platform || (b.platform === 'PC' && platform === 'PC')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuild) return;
    onApply(platform, selectedBuild);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-100">Inject Build Number</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-3">
              Apply an active build version from the Branches Registry to{' '}
              <span className="font-semibold text-slate-200">
                {isSelectedBatch ? `${selectedTicketIds.length} selected row(s)` : `all ${targetCount} row(s) in active queue`}
              </span>
              .
            </p>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              1. Select Platform Column
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['PC', 'PS5', 'XSX', 'Switch 2'] as GamingPlatform[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setSelectedBuild('');
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                    platform === p
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200 font-semibold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              2. Select Active Build for {platform}
            </label>
            {filteredBuilds.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                No active builds registered for {platform}. You can add builds in the Branches & Builds tab.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredBuilds.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBuild(b.currentBuildName)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      selectedBuild === b.currentBuildName
                        ? 'border-indigo-500 bg-indigo-500/10 text-slate-100 shadow-xs'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-indigo-300">{b.currentBuildName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Branch: {b.branchName} • Date: {b.useDate}
                      </div>
                    </div>
                    {selectedBuild === b.currentBuildName && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Or manually type a custom build identifier:
            </label>
            <input
              type="text"
              value={selectedBuild}
              onChange={(e) => setSelectedBuild(e.target.value)}
              placeholder="e.g. Build_1.2.0_rc4_D3D12"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
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
              disabled={!selectedBuild}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
            >
              Apply Build to {targetCount} Ticket{targetCount === 1 ? '' : 's'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
