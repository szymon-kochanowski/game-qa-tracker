import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Layers,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import {
  BugTicket,
  RegreTab,
  Priority,
  SortField,
  SortDirection,
  UserAccount,
} from '../../types';
import { BugTable } from './BugTable';
import { exportTabToCSV } from '../../services/csvParser';

interface RegressionQueueViewProps {
  tabs: RegreTab[];
  activeTabId: string;
  jiraBaseUrl: string;
  currentUser: UserAccount | null;
  onSelectTab: (tabId: string) => void;
  onCreateTab: (name: string) => void;
  onDeleteTab: (tabId: string) => void;
  onClearTab: (tabId: string) => void;
  onAddTicket: () => void;
  onUpdateTicket: (updated: BugTicket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onBatchUpdateTickets: (updatedTickets: BugTicket[]) => void;
  onOpenJiraComment: (ticket: BugTicket) => void;
  onOpenInjectBuild: () => void;
  selectedTicketIds: string[];
  onToggleSelectTicket: (ticketId: string) => void;
  onSelectAllTickets: (checked: boolean) => void;
}

const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 1,
  Highest: 2,
  High: 3,
  Medium: 4,
  Low: 5,
  Lowest: 6,
};

export const RegressionQueueView: React.FC<RegressionQueueViewProps> = ({
  tabs,
  activeTabId,
  jiraBaseUrl,
  currentUser,
  onSelectTab,
  onCreateTab,
  onClearTab,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket,
  onOpenJiraComment,
  onOpenInjectBuild,
  selectedTicketIds,
  onToggleSelectTicket,
  onSelectAllTickets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bugTypeFilter, setBugTypeFilter] = useState<string>('ALL');
  const [onlyMyBugs, setOnlyMyBugs] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('sortHelper');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [isCreatingTab, setIsCreatingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtering and sorting logic
  const filteredTickets = useMemo(() => {
    if (!currentTab) return [];

    return currentTab.tickets
      .filter((t) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            t.bugId.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q) ||
            (t.comment && t.comment.toLowerCase().includes(q)) ||
            (t.blockedBy && t.blockedBy.toLowerCase().includes(q)) ||
            (t.assignedTester && t.assignedTester.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Only my bugs filter
        if (onlyMyBugs && currentUser) {
          const myName = currentUser.displayName.toLowerCase();
          const isAssigned = t.assignedTester && t.assignedTester.toLowerCase().includes(myName);
          const isCommented = t.comment && t.comment.toLowerCase().includes(myName);
          if (!isAssigned && !isCommented) return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'ALL' && t.status !== statusFilter) {
          return false;
        }

        // Bug Type filter
        if (bugTypeFilter !== 'ALL' && t.bugType !== bugTypeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'priority') {
          const wA = PRIORITY_ORDER[a.priority] || 4;
          const wB = PRIORITY_ORDER[b.priority] || 4;
          compare = wA - wB;
        } else if (sortField === 'bugId') {
          compare = a.bugId.localeCompare(b.bugId, undefined, { numeric: true });
        } else if (sortField === 'status') {
          compare = a.status.localeCompare(b.status);
        } else if (sortField === 'date') {
          compare = (a.dateStamped || a.createdAt).localeCompare(b.dateStamped || b.createdAt);
        } else {
          // Default sort helper
          compare = (a.sortHelper ?? 99) - (b.sortHelper ?? 99);
        }
        return sortDirection === 'asc' ? compare : -compare;
      });
  }, [
    currentTab,
    searchQuery,
    priorityFilter,
    statusFilter,
    bugTypeFilter,
    onlyMyBugs,
    currentUser,
    sortField,
    sortDirection,
  ]);

  // Statistics
  const stats = useMemo(() => {
    if (!currentTab) return { total: 0, toTest: 0, inProgress: 0, review: 0, blocked: 0, done: 0 };
    const tickets = currentTab.tickets;
    return {
      total: tickets.length,
      toTest: tickets.filter((t) => t.status === 'To Test').length,
      inProgress: tickets.filter((t) => t.status === 'In Progress').length,
      review: tickets.filter((t) => t.status === 'To Be Reviewed').length,
      blocked: tickets.filter((t) => t.status === 'Blocked').length,
      done: tickets.filter((t) => t.status === 'Done').length,
    };
  }, [currentTab]);

  const handleExportCSV = () => {
    if (!currentTab) return;
    const csvContent = exportTabToCSV(currentTab, jiraBaseUrl);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTab.name.replace(/\s+/g, '_')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    onCreateTab(newTabName.trim());
    setNewTabName('');
    setIsCreatingTab(false);
  };

  const handleClearCurrentTab = () => {
    if (!currentTab) return;
    if (
      window.confirm(
        `Clear all testing rows from "${currentTab.name}"? (Tab structure will be preserved)`
      )
    ) {
      onClearTab(currentTab.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`py-2 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>{tab.name}</span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded">
                  {tab.tickets.length}
                </span>
              </button>
            );
          })}

          {isCreatingTab ? (
            <form onSubmit={handleCreateTabSubmit} className="flex items-center gap-1.5 ml-1">
              <input
                type="text"
                autoFocus
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="e.g. Regre Hotfix 1.2"
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-indigo-500 text-slate-200 focus:outline-none w-36"
              />
              <button
                type="submit"
                className="px-2 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingTab(false)}
                className="px-2 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingTab(true)}
              className="py-1.5 px-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-dashed border-slate-800 flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tab</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            title="Export CSV matching spreadsheet schema"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddTicket}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-slate-400 block mb-0.5">Total Queue</span>
          <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {stats.total}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-indigo-400 block mb-0.5">To Test</span>
          <span className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
            {stats.toTest}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-amber-400 block mb-0.5">In Progress</span>
          <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {stats.inProgress}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-emerald-400 block mb-0.5">To Be Reviewed</span>
          <span className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {stats.review}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-purple-400 block mb-0.5">Blocked</span>
          <span className="text-xl font-bold font-mono text-purple-300 tabular-nums">
            {stats.blocked}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <span className="text-[11px] text-slate-400 block mb-0.5">Verified / Done</span>
          <span className="text-xl font-bold font-mono text-slate-400 tabular-nums">
            {stats.done}
          </span>
        </div>
      </div>

      {/* Filter, Sort & Batch Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search box */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, summary, tester..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={`${sortField}_${sortDirection}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split('_');
                setSortField(f as SortField);
                setSortDirection(d as SortDirection);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="priority_asc" className="bg-slate-900">Priority (Critical first)</option>
              <option value="priority_desc" className="bg-slate-900">Priority (Lowest first)</option>
              <option value="sortHelper_asc" className="bg-slate-900">Automated Queue Weight</option>
              <option value="bugId_asc" className="bg-slate-900">Bug ID (A-Z)</option>
              <option value="status_asc" className="bg-slate-900">Status</option>
              <option value="date_desc" className="bg-slate-900">Date Stamped (Newest)</option>
            </select>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="To Test">To Test</option>
            <option value="In Progress">In Progress</option>
            <option value="To Be Reviewed">To Be Reviewed</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
            <option value="Sent Back">Sent Back</option>
          </select>

          {/* Tester personal view toggle */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setOnlyMyBugs(!onlyMyBugs)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                onlyMyBugs
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </button>
          )}

          {(searchQuery || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || bugTypeFilter !== 'ALL' || onlyMyBugs) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('ALL');
                setStatusFilter('ALL');
                setBugTypeFilter('ALL');
                setOnlyMyBugs(false);
              }}
              className="text-indigo-400 hover:underline px-1 text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Batch action buttons */}
        <div className="flex items-center gap-2 text-xs">
          {selectedTicketIds.length > 0 && (
            <button
              onClick={onOpenInjectBuild}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inject Build ({selectedTicketIds.length})</span>
            </button>
          )}

          <button
            onClick={handleClearCurrentTab}
            title="Clear all tickets from this tab"
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Bug Table */}
      <BugTable
        tickets={filteredTickets}
        selectedTicketIds={selectedTicketIds}
        jiraBaseUrl={jiraBaseUrl}
        sortField={sortField}
        sortDirection={sortDirection}
        currentUser={currentUser}
        onSortChange={handleSortChange}
        onToggleSelect={onToggleSelectTicket}
        onSelectAll={onSelectAllTickets}
        onUpdateTicket={onUpdateTicket}
        onDeleteTicket={onDeleteTicket}
        onOpenJiraComment={onOpenJiraComment}
      />
    </div>
  );
};
