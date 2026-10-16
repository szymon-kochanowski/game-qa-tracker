import React, { useMemo } from 'react';
import { Clock, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { TesterEffortRow, QAWorkCategory, TesterAttendance } from '../../types';

interface TaskHoursViewProps {
  rows: TesterEffortRow[];
  onUpdateRows: (rows: TesterEffortRow[]) => void;
}

const CATEGORIES: QAWorkCategory[] = [
  'Test Plan',
  'Localization Testing',
  'PC Destructive testing',
  'Console Destructive testing',
  'QA Ready/Cross checks/NMIs',
  'Ticket creation/Investigation',
  'Focused testing',
  'Regression Testing',
  'Performance Testing',
];

export const TaskHoursView: React.FC<TaskHoursViewProps> = ({ rows, onUpdateRows }) => {
  // Compute category totals across all testers
  const categoryTotals = useMemo(() => {
    const map: Record<QAWorkCategory, number> = {
      'Test Plan': 0,
      'Localization Testing': 0,
      'PC Destructive testing': 0,
      'Console Destructive testing': 0,
      'QA Ready/Cross checks/NMIs': 0,
      'Ticket creation/Investigation': 0,
      'Focused testing': 0,
      'Regression Testing': 0,
      'Performance Testing': 0,
    };
    let totalAll = 0;

    for (const r of rows) {
      if (r.status === 'Absent') continue;
      for (const slot of r.slots) {
        if (slot.task && slot.hours > 0) {
          map[slot.task] = (map[slot.task] || 0) + Number(slot.hours);
          totalAll += Number(slot.hours);
        }
      }
    }
    return { map, totalAll };
  }, [rows]);

  const handleSlotChange = (
    testerId: string,
    slotIndex: number,
    field: 'task' | 'hours',
    val: any
  ) => {
    const updated = rows.map((r) => {
      if (r.id === testerId) {
        const nextSlots = [...r.slots] as typeof r.slots;
        if (field === 'task') {
          nextSlots[slotIndex] = { ...nextSlots[slotIndex], task: val };
        } else {
          nextSlots[slotIndex] = {
            ...nextSlots[slotIndex],
            hours: Math.max(0, parseFloat(val) || 0),
          };
        }
        return { ...r, slots: nextSlots };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  const handleStatusChange = (testerId: string, newStatus: TesterAttendance) => {
    const updated = rows.map((r) => {
      if (r.id === testerId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  const handleClearTaskHours = () => {
    if (
      window.confirm(
        'Clear all task effort hours and reset all testers to "Absent"? (EoD Reset)'
      )
    ) {
      const reset = rows.map((r) => ({
        ...r,
        status: 'Absent' as TesterAttendance,
        slots: [
          { task: '' as const, hours: 0 },
          { task: '' as const, hours: 0 },
          { task: '' as const, hours: 0 },
          { task: '' as const, hours: 0 },
          { task: '' as const, hours: 0 },
        ] as typeof r.slots,
      }));
      onUpdateRows(reset);
    }
  };

  const handleAddTester = () => {
    const name = window.prompt('Enter new tester name:');
    if (!name || !name.trim()) return;

    const newRow: TesterEffortRow = {
      id: `tester_${Date.now()}`,
      testerName: name.trim(),
      status: 'Active',
      slots: [
        { task: '', hours: 0 },
        { task: '', hours: 0 },
        { task: '', hours: 0 },
        { task: '', hours: 0 },
        { task: '', hours: 0 },
      ],
    };
    onUpdateRows([...rows, newRow]);
  };

  const handleDeleteTester = (testerId: string) => {
    onUpdateRows(rows.filter((r) => r.id !== testerId));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Task Hours & End of Day (EoD) Effort Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log individual tester hours across 5 task slots. Total category effort updates dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTester}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Tester</span>
          </button>
          <button
            onClick={handleClearTaskHours}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-900/60 rounded-lg hover:bg-rose-900/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Task Hours (Reset)</span>
          </button>
        </div>
      </div>

      {/* Category Totals Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Studio Total Task Effort by Category
          </span>
          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded">
            Total Team Effort: {categoryTotals.totalAll.toFixed(1)} hrs
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {CATEGORIES.map((cat) => {
            const hrs = categoryTotals.map[cat] || 0;
            return (
              <div
                key={cat}
                className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 flex flex-col justify-between"
              >
                <span className="text-[11px] text-slate-400 leading-tight truncate" title={cat}>
                  {cat}
                </span>
                <span className="text-lg font-mono font-bold text-slate-100 tabular-nums mt-1">
                  {hrs.toFixed(1)} <span className="text-xs font-normal text-slate-500">h</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tester Effort Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-3 w-36">Tester Name</th>
                <th className="py-3 px-3 w-28">Status</th>
                <th className="py-3 px-3 min-w-[180px]">Task 1 & Hours</th>
                <th className="py-3 px-3 min-w-[180px]">Task 2 & Hours</th>
                <th className="py-3 px-3 min-w-[180px]">Task 3 & Hours</th>
                <th className="py-3 px-3 min-w-[180px]">Task 4 & Hours</th>
                <th className="py-3 px-3 min-w-[180px]">Task 5 & Hours</th>
                <th className="py-3 px-3 w-24 text-right">Total</th>
                <th className="py-3 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {rows.map((r) => {
                const totalRowHours = r.slots.reduce((sum, s) => sum + (Number(s.hours) || 0), 0);
                const isAbsent = r.status === 'Absent';

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isAbsent ? 'opacity-60 bg-slate-950/40' : ''
                    }`}
                  >
                    {/* Tester name */}
                    <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                      {r.testerName}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as TesterAttendance)}
                        className={`text-[11px] rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${
                          r.status === 'Active'
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                            : r.status === 'Absent'
                            ? 'bg-slate-900 text-slate-500 border-slate-800'
                            : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Absent">Absent</option>
                        <option value="Half-day">Half-day</option>
                        <option value="Sick">Sick</option>
                      </select>
                    </td>

                    {/* 5 Slots */}
                    {r.slots.map((slot, sIdx) => (
                      <td key={sIdx} className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={isAbsent}
                            value={slot.task}
                            onChange={(e) =>
                              handleSlotChange(r.id, sIdx, 'task', e.target.value as QAWorkCategory)
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                          >
                            <option value="">— Empty —</option>
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            max="12"
                            step="0.5"
                            disabled={isAbsent}
                            value={slot.hours > 0 ? slot.hours : ''}
                            onChange={(e) => handleSlotChange(r.id, sIdx, 'hours', e.target.value)}
                            placeholder="0"
                            className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[11px] font-mono text-center text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                          />
                        </div>
                      </td>
                    ))}

                    {/* Total Row Hours */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200 tabular-nums">
                      {totalRowHours.toFixed(1)}h
                    </td>

                    {/* Delete Tester */}
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => handleDeleteTester(r.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
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
