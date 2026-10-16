import React, { useState } from 'react';
import {
  Layers,
  FileSpreadsheet,
  Calendar,
  Clock,
  Upload,
  BookOpen,
  ChevronDown,
  Wrench,
  BarChart2,
  Filter,
  Trash2,
  ShieldCheck,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { UserAccount } from '../types';

export type ActiveNavTab = 'regression' | 'dailyTasks' | 'branches' | 'taskHours' | 'csvDrop';

interface HeaderProps {
  activeTab: ActiveNavTab;
  currentUser: UserAccount | null;
  onTabChange: (tab: ActiveNavTab) => void;
  onOpenJql: () => void;
  onOpenDailyReport: () => void;
  onOpenDocumentation: () => void;
  onOpenSettings: () => void;
  onOpenLeadPanel: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenInjectBuild: () => void;
  onDeleteResolved: () => void;
  ticketCount: number;
  reviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onTabChange,
  onOpenJql,
  onOpenDailyReport,
  onOpenDocumentation,
  onOpenSettings,
  onOpenLeadPanel,
  onOpenLogin,
  onLogout,
  onOpenInjectBuild,
  onDeleteResolved,
  ticketCount,
  reviewCount,
}) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isLeadOrDeputy = currentUser?.role === 'lead' || currentUser?.role === 'deputy';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 sm:gap-6 max-w-[1600px] mx-auto">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
            <span className="font-bold text-white text-xs sm:text-sm">QA</span>
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Regression Suite
          </span>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium text-slate-400 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <button
            onClick={() => onTabChange('regression')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'regression'
                ? 'bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Regression</span>
            {reviewCount > 0 && (
              <span className="ml-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                {reviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('dailyTasks')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dailyTasks'
                ? 'bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Tasks</span>
          </button>

          <button
            onClick={() => onTabChange('branches')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'branches'
                ? 'bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Builds</span>
          </button>

          <button
            onClick={() => onTabChange('taskHours')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'taskHours'
                ? 'bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Task Hours</span>
          </button>

          <button
            onClick={() => onTabChange('csvDrop')}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'csvDrop'
                ? 'bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Drop</span>
          </button>
        </nav>

        {/* Zone 3: Actions & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Lead Panel Quick Access if Lead or Deputy */}
          {isLeadOrDeputy && (
            <button
              onClick={onOpenLeadPanel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-lg hover:bg-amber-900/40 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Lead Panel</span>
            </button>
          )}

          {/* QA Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">QA Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {toolsDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 font-semibold text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  Operations & Macros
                </div>
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenInjectBuild();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Inject Build Number
                </button>
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenJql();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  Generate JQL for Review
                </button>
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenDailyReport();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  Generate Daily Report
                </button>
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onDeleteResolved();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Delete Resolved Bugs
                </button>
              </div>
            )}
          </div>

          {/* User profile / login button */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                  {currentUser.displayName.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.displayName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {userDropdownOpen && currentUser && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold text-slate-200">{currentUser.displayName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">@{currentUser.username}</div>
                  <div className="mt-1">
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        currentUser.role === 'lead'
                          ? 'bg-amber-950/60 text-amber-300'
                          : currentUser.role === 'deputy'
                          ? 'bg-sky-950/60 text-sky-300'
                          : 'bg-indigo-950/60 text-indigo-300'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {isLeadOrDeputy && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenLeadPanel();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Open Lead Panel
                  </button>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  Switch User
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenDocumentation}
            title="Open SOP Documentation"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
