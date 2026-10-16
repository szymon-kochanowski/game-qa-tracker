import React, { useState, useEffect } from 'react';
import { AppData, BugTicket, GamingPlatform, RegreTab, UserAccount } from './types';
import {
  loadAppState,
  saveAppState,
  getStoredAuthUser,
  saveStoredAuthUser,
  DEFAULT_USERS,
} from './services/storage';
import { Header, ActiveNavTab } from './components/Header';
import { RegressionQueueView } from './components/RegressionQueue/RegressionQueueView';
import { DailyTasksView } from './components/DailyTasks/DailyTasksView';
import { BranchesView } from './components/Branches/BranchesView';
import { TaskHoursView } from './components/TaskHours/TaskHoursView';
import { CsvImportView } from './components/CsvImport/CsvImportView';

// Modals
import { JiraCommentModal } from './components/Modals/JiraCommentModal';
import { InjectBuildModal } from './components/Modals/InjectBuildModal';
import { JqlModal } from './components/Modals/JqlModal';
import { DailyReportModal } from './components/Modals/DailyReportModal';
import { PublishAssignmentsModal } from './components/Modals/PublishAssignmentsModal';
import { DocumentationModal } from './components/Modals/DocumentationModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { NewBugModal } from './components/Modals/NewBugModal';
import { LoginModal } from './components/Auth/LoginModal';
import { LeadPanelModal } from './components/LeadPanel/LeadPanelModal';

export default function App() {
  const [data, setData] = useState<AppData>(loadAppState);
  const [navTab, setNavTab] = useState<ActiveNavTab>('regression');

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getStoredAuthUser() || data.settings.users[0] || DEFAULT_USERS[0];
  });

  // Modals state
  const [commentModalTicket, setCommentModalTicket] = useState<BugTicket | null>(null);
  const [isInjectBuildOpen, setIsInjectBuildOpen] = useState(false);
  const [isJqlOpen, setIsJqlOpen] = useState(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isPublishTasksOpen, setIsPublishTasksOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeadPanelOpen, setIsLeadPanelOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNewBugOpen, setIsNewBugOpen] = useState(false);

  // Selected ticket IDs in active tab
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Sync to localStorage whenever data changes
  useEffect(() => {
    saveAppState(data);
  }, [data]);

  // Sync auth state
  useEffect(() => {
    saveStoredAuthUser(currentUser);
  }, [currentUser]);

  const activeTab = data.tabs.find((t) => t.id === data.activeTabId) || data.tabs[0];

  // Helper to update tickets in active tab
  const updateActiveTabTickets = (newTickets: BugTicket[]) => {
    setData((prev) => {
      const updatedTabs = prev.tabs.map((tab) => {
        if (tab.id === prev.activeTabId) {
          return { ...tab, tickets: newTickets };
        }
        return tab;
      });
      return { ...prev, tabs: updatedTabs };
    });
  };

  // Ticket CRUD
  const handleUpdateTicket = (updatedTicket: BugTicket) => {
    if (!activeTab) return;
    const newTickets = activeTab.tickets.map((t) =>
      t.id === updatedTicket.id ? updatedTicket : t
    );
    updateActiveTabTickets(newTickets);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!activeTab) return;
    const newTickets = activeTab.tickets.filter((t) => t.id !== ticketId);
    updateActiveTabTickets(newTickets);
    setSelectedTicketIds((prev) => prev.filter((id) => id !== ticketId));
  };

  const handleAddTicket = (ticket: BugTicket) => {
    if (!activeTab) return;
    updateActiveTabTickets([ticket, ...activeTab.tickets]);
  };

  // Multi-select handlers
  const handleToggleSelectTicket = (ticketId: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleSelectAllTickets = (checked: boolean) => {
    if (checked && activeTab) {
      setSelectedTicketIds(activeTab.tickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  // Tab operations
  const handleSelectTab = (tabId: string) => {
    setData((prev) => ({ ...prev, activeTabId: tabId }));
    setSelectedTicketIds([]);
  };

  const handleCreateTab = (name: string) => {
    const newTab: RegreTab = {
      id: `tab_${Date.now()}`,
      name,
      tickets: [],
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
    setSelectedTicketIds([]);
  };

  const handleDeleteTab = (tabId: string) => {
    setData((prev) => {
      const remaining = prev.tabs.filter((t) => t.id !== tabId);
      const nextActiveId =
        prev.activeTabId === tabId ? remaining[0]?.id || '' : prev.activeTabId;
      return {
        ...prev,
        tabs: remaining,
        activeTabId: nextActiveId,
      };
    });
    setSelectedTicketIds([]);
  };

  const handleClearTab = (tabId: string) => {
    setData((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, tickets: [] } : t)),
    }));
    setSelectedTicketIds([]);
  };

  // Macro: Delete Resolved Bugs ("Done" and "Sent Back")
  const handleDeleteResolvedBugs = () => {
    if (!activeTab) return;
    const initialCount = activeTab.tickets.length;
    const kept = activeTab.tickets.filter(
      (t) => t.status !== 'Done' && t.status !== 'Sent Back'
    );
    const removedCount = initialCount - kept.length;

    if (removedCount === 0) {
      alert(`No 'Done' or 'Sent Back' rows found in ${activeTab.name}.`);
      return;
    }

    if (
      window.confirm(
        `Permanently remove ${removedCount} resolved ("Done" or "Sent Back") bugs from ${activeTab.name}?`
      )
    ) {
      updateActiveTabTickets(kept);
      setSelectedTicketIds([]);
    }
  };

  // Macro: Inject Build Number to platform
  const handleApplyBuild = (platform: GamingPlatform, buildName: string) => {
    if (!activeTab) return;
    const targetIds =
      selectedTicketIds.length > 0
        ? selectedTicketIds
        : activeTab.tickets.map((t) => t.id);

    const updatedTickets = activeTab.tickets.map((t) => {
      if (!targetIds.includes(t.id)) return t;
      const copy = { ...t, updatedAt: new Date().toISOString() };
      if (platform === 'PC') copy.pcBuild = buildName;
      if (platform === 'PS5') copy.ps5Build = buildName;
      if (platform === 'XSX') copy.xsxBuild = buildName;
      if (platform === 'Switch 2') copy.switch2Build = buildName;
      return copy;
    });

    updateActiveTabTickets(updatedTickets);
  };

  // CSV Import Execution
  const handleImportComplete = (
    targetTabId: string,
    added: BugTicket[],
    updated: { bugId: string; summary: string; priority: any }[]
  ) => {
    setData((prev) => {
      const updatedMap = new Map(updated.map((u) => [u.bugId, u]));
      const newTabs = prev.tabs.map((tab) => {
        if (tab.id !== targetTabId) return tab;

        // Apply updates to existing
        const modified = tab.tickets.map((t) => {
          if (updatedMap.has(t.bugId)) {
            const u = updatedMap.get(t.bugId)!;
            return {
              ...t,
              summary: u.summary || t.summary,
              priority: u.priority || t.priority,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });

        return {
          ...tab,
          tickets: [...added, ...modified],
        };
      });

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: targetTabId,
      };
    });

    setNavTab('regression');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginOpen(true);
  };

  const totalReviewCount = activeTab
    ? activeTab.tickets.filter((t) => t.status === 'To Be Reviewed').length
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        activeTab={navTab}
        currentUser={currentUser}
        onTabChange={setNavTab}
        onOpenJql={() => setIsJqlOpen(true)}
        onOpenDailyReport={() => setIsDailyReportOpen(true)}
        onOpenDocumentation={() => setIsDocOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeadPanel={() => setIsLeadPanelOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenInjectBuild={() => setIsInjectBuildOpen(true)}
        onDeleteResolved={handleDeleteResolvedBugs}
        ticketCount={activeTab ? activeTab.tickets.length : 0}
        reviewCount={totalReviewCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        {navTab === 'regression' && (
          <RegressionQueueView
            tabs={data.tabs}
            activeTabId={data.activeTabId}
            jiraBaseUrl={data.settings.jiraBaseUrl}
            currentUser={currentUser}
            onSelectTab={handleSelectTab}
            onCreateTab={handleCreateTab}
            onDeleteTab={handleDeleteTab}
            onClearTab={handleClearTab}
            onAddTicket={() => setIsNewBugOpen(true)}
            onUpdateTicket={handleUpdateTicket}
            onDeleteTicket={handleDeleteTicket}
            onBatchUpdateTickets={updateActiveTabTickets}
            onOpenJiraComment={(ticket) => setCommentModalTicket(ticket)}
            onOpenInjectBuild={() => setIsInjectBuildOpen(true)}
            selectedTicketIds={selectedTicketIds}
            onToggleSelectTicket={handleToggleSelectTicket}
            onSelectAllTickets={handleSelectAllTickets}
          />
        )}

        {navTab === 'dailyTasks' && (
          <DailyTasksView
            assignments={data.dailyTasks}
            builds={data.builds}
            users={data.settings.users}
            currentUser={currentUser}
            onUpdateAssignments={(updated) =>
              setData((prev) => ({ ...prev, dailyTasks: updated }))
            }
            onOpenPublishModal={() => setIsPublishTasksOpen(true)}
          />
        )}

        {navTab === 'branches' && (
          <BranchesView
            builds={data.builds}
            onUpdateBuilds={(updated) => setData((prev) => ({ ...prev, builds: updated }))}
          />
        )}

        {navTab === 'taskHours' && (
          <TaskHoursView
            rows={data.taskHours}
            onUpdateRows={(updated) => setData((prev) => ({ ...prev, taskHours: updated }))}
          />
        )}

        {navTab === 'csvDrop' && (
          <CsvImportView
            tabs={data.tabs}
            activeTabId={data.activeTabId}
            onImportComplete={handleImportComplete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>{data.settings.studioName}</span>
            <span aria-hidden="true">•</span>
            <span>Regression Tracker Suite</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-slate-600">
              {data.settings.googleSheets.enabled ? 'Google Sheets Sync Active' : 'Local Storage Mode'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsDocOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Standard Operating Procedures (SOP)
            </button>
            <button
              onClick={() => setIsLeadPanelOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Lead Panel
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {commentModalTicket && (
        <JiraCommentModal
          ticket={commentModalTicket}
          jiraBaseUrl={data.settings.jiraBaseUrl}
          onClose={() => setCommentModalTicket(null)}
        />
      )}

      {isInjectBuildOpen && (
        <InjectBuildModal
          builds={data.builds}
          selectedTicketIds={selectedTicketIds}
          allTicketCount={activeTab ? activeTab.tickets.length : 0}
          onApply={handleApplyBuild}
          onClose={() => setIsInjectBuildOpen(false)}
        />
      )}

      {isJqlOpen && (
        <JqlModal
          tickets={activeTab ? activeTab.tickets : []}
          tabName={activeTab ? activeTab.name : 'Active Queue'}
          onClose={() => setIsJqlOpen(false)}
        />
      )}

      {isDailyReportOpen && (
        <DailyReportModal
          tickets={activeTab ? activeTab.tickets : []}
          tabName={activeTab ? activeTab.name : 'Active Queue'}
          onClose={() => setIsDailyReportOpen(false)}
        />
      )}

      {isPublishTasksOpen && (
        <PublishAssignmentsModal
          assignments={data.dailyTasks}
          onClose={() => setIsPublishTasksOpen(false)}
        />
      )}

      {isDocOpen && <DocumentationModal onClose={() => setIsDocOpen(false)} />}

      {isLeadPanelOpen && (
        <LeadPanelModal
          settings={data.settings}
          tabs={data.tabs}
          fullData={data}
          onUpdateSettings={(newSettings) =>
            setData((prev) => ({ ...prev, settings: newSettings }))
          }
          onUpdateTabs={(newTabs) => setData((prev) => ({ ...prev, tabs: newTabs }))}
          onRestoreData={(restored) => setData(restored)}
          onClose={() => setIsLeadPanelOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={data.settings}
          fullData={data}
          onUpdateSettings={(newSettings) =>
            setData((prev) => ({ ...prev, settings: newSettings }))
          }
          onRestoreData={(restored) => setData(restored)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          users={data.settings.users}
          currentUser={currentUser}
          onLogin={(user) => {
            setCurrentUser(user);
            setIsLoginOpen(false);
          }}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

      {isNewBugOpen && (
        <NewBugModal
          onAddTicket={handleAddTicket}
          onClose={() => setIsNewBugOpen(false)}
        />
      )}
    </div>
  );
}
