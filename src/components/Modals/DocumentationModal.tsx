import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'automations' | 'routines' | 'triage'>('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl max-h-[88vh] rounded-xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-base font-semibold text-slate-100">
                QA Tracker 2.0 • Standard Operating Procedures (SOP)
              </span>
              <p className="text-xs text-slate-400">
                Studio regression guidelines & automated workflow handbook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'automations'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Background Automations
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'routines'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lead & Tester Routines
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'triage'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Regex Triage Rules
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-indigo-950/30 border border-indigo-900/40 p-4">
                <h4 className="font-semibold text-indigo-300 text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Architecture & Purpose
                </h4>
                <p className="text-slate-300">
                  The Game QA Regression Tracker bridges Jira and the game studio QA team&apos;s daily
                  testing workflow. It operates on high-speed CSV ingestion, eliminating manual data entry,
                  enforcing console mutual exclusivity, and automating ticket handoffs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-1">
                    Pipeline A: Bug Lifecycle
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Ingestion from Jira CSV export</li>
                    <li>Automated regex bug type triage</li>
                    <li>Console target assignment</li>
                    <li>Tester verification & build tagging</li>
                    <li>Auto-promotion to &quot;To Be Reviewed&quot;</li>
                    <li>Bulk closing via generated JQL</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-1">
                    Pipeline B: Operations & Registry
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Active build registry (PC, PS5, XSX, Switch 2)</li>
                    <li>Daily assignment board with branch lookup</li>
                    <li>Morning Slack broadcasts with @tester mentions</li>
                    <li>End of Day (EoD) effort logging</li>
                    <li>Daily executive metrics summary</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automations' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-indigo-300 text-sm block mb-1">
                  1. Console Mutual Exclusivity
                </span>
                <p className="text-slate-400">
                  When a tester marks a bug as <span className="font-mono text-amber-300">&quot;In Progress&quot;</span> on PS5,
                  the system automatically marks XSX and Switch 2 as <span className="font-mono text-slate-400">&quot;N/A&quot;</span>{' '}
                  if they were set to <span className="font-mono">&quot;PS5 or XSX&quot;</span> or{' '}
                  <span className="font-mono">&quot;Any Console&quot;</span>. This eliminates duplicate testing effort across console SDKs.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-indigo-300 text-sm block mb-1">
                  2. Auto-Handoff & Reverser
                </span>
                <p className="text-slate-400">
                  When all assigned platforms evaluate to a terminal state (Fixed, Occurs, Blocked, or N/A),
                  the overall bug status is automatically upgraded to{' '}
                  <span className="font-mono text-emerald-400">&quot;To Be Reviewed&quot;</span>. If a tester subsequently
                  reverts any platform back to testing, the ticket automatically reverts to{' '}
                  <span className="font-mono text-sky-400">&quot;In Progress&quot;</span>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-indigo-300 text-sm block mb-1">
                  3. Automated Date Stamping
                </span>
                <p className="text-slate-400">
                  Changing a status to <span className="font-mono text-emerald-400">&quot;Done&quot;</span> or{' '}
                  <span className="font-mono text-rose-400">&quot;Sent Back&quot;</span> automatically stamps the exact timestamp,
                  enabling precise velocity calculations for daily EoD reports.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-indigo-300 text-sm block mb-1">
                  4. Cross-Sprint Duplicate Prevention
                </span>
                <p className="text-slate-400">
                  When importing a Jira CSV, the engine scans all existing regression tabs. If a ticket is already active
                  in another sprint (e.g. Sprint 13), it is skipped and logged to prevent double-testing across milestones.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'routines' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-100 text-sm block mb-2">
                  ☀️ QA Lead Morning Routine
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Export active regression queue from Jira as CSV.</li>
                  <li>Paste into <span className="font-mono text-indigo-400">CSV Drop</span>, choose target sprint, and run Ingestion.</li>
                  <li>Review active builds in <span className="font-mono text-indigo-400">Branches & Builds</span>.</li>
                  <li>Assign testers in <span className="font-mono text-indigo-400">Daily Tasks</span> (Branch lookup auto-fills build number).</li>
                  <li>Click <span className="font-semibold text-white">&quot;Publish Daily Assignments&quot;</span> and paste into studio chat.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-100 text-sm block mb-2">
                  🎮 QA Tester Daily Workflow
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Locate assigned tickets in active sprint queue.</li>
                  <li>Mark platform status <span className="font-mono text-amber-300">&quot;In Progress&quot;</span> (console exclusivity auto-triggers).</li>
                  <li>Verify fix or regression on game build; change platform status to Fixed, Occurs, or Blocked.</li>
                  <li>Click <span className="font-semibold text-white">&quot;Copy Jira Comment&quot;</span> on the ticket and paste into Jira.</li>
                  <li>Log daily hours in <span className="font-mono text-indigo-400">Task Hours</span> tab before EoD.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-100 text-sm block mb-2">
                  🌙 QA Lead Evening Routine
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Click <span className="font-semibold text-white">&quot;Generate JQL for Review&quot;</span> to get ticket query.</li>
                  <li>Bulk-close reviewed tickets in Jira. Mark them as &quot;Done&quot; in the suite.</li>
                  <li>Click <span className="font-semibold text-white">&quot;Generate Daily Report&quot;</span> and post EoD metrics.</li>
                  <li>(Optional) Clean closed bugs via <span className="font-semibold text-rose-300">&quot;Delete Resolved Bugs&quot;</span>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'triage' && (
            <div className="space-y-3">
              <p className="text-slate-400">
                Keywords matched in ticket summaries to automatically triage Bug Type and assign platform targets:
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-rose-400 font-bold block mb-1">Stability (All Platforms)</span>
                  <span className="text-slate-400">crash, freeze, fatal error, softlock, hang, bsod, memory leak</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Visual (PS5 or XSX)</span>
                  <span className="text-slate-400">texture, clipping, animation, model, lighting, shadow, pop-in, render, t-pose, vfx, z-fighting</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-sky-400 font-bold block mb-1">Gameplay (Any Console)</span>
                  <span className="text-slate-400">collision, stuck, combat, ai, npc, physics, progression, spawn, weapon, quest, out of bounds</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Localization (Any Console)</span>
                  <span className="text-slate-400">translation, typo, string, language, unlocalized, german, french, spanish, grammar, l10n</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-1">UI/UX (All Platforms)</span>
                  <span className="text-slate-400">ui, menu, hud, button, icon, tooltip, prompt, cursor, minimap, widget, cutoff, crosshair</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">Achievements (PC, PS5, XSX)</span>
                  <span className="text-slate-400">achievement, trophy, unlock, trigger, gamerscore, badge, 100%, not tracking (Switch: N/A)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
