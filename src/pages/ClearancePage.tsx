import { useState } from 'react';
import { CheckCircle2, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { IncidentStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';
import { EnforcementAction, IncidentStatus } from '../types/system';

export function ClearancePage() {
  const {
    incidents,
    units,
    dispatchUnitToIncident,
    updateIncidentProgress,
    navigateToMapRoad,
  } = useSystem();

  const [statusTab, setStatusTab] = useState<'active' | IncidentStatus | 'all'>('active');
  const [selectedActions, setSelectedActions] = useState<Record<string, EnforcementAction>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});

  const filteredIncidents = incidents.filter((inc) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'active') return inc.status !== 'Cleared';
    return inc.status === statusTab;
  });

  const activeCount = incidents.filter((i) => i.status !== 'Cleared').length;
  const clearedCount = incidents.filter((i) => i.status === 'Cleared').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Road Clearance Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Assign Bidhannagar tow cranes and clamping squads, log enforcement action, and restore blocked Sector V corridors to clear flow.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
          {(
            [
              ['active', `Active Queue (${activeCount})`],
              ['Reported', 'Unassigned'],
              ['Dispatched', 'Dispatched'],
              ['Clearing', 'On Scene'],
              ['Cleared', `Cleared (${clearedCount})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatusTab(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusTab === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="text-base font-semibold text-slate-900">No incidents in this clearance stage</p>
          <p className="text-xs text-slate-500">
            Switch tabs above to inspect active dispatches or previously cleared Sector V obstructions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((inc) => {
            const chosenUnit =
              selectedUnits[inc.id] ??
              inc.assignedUnitId ??
              units.find((u) => u.status === 'Available')?.id ??
              units[0].id;
            const chosenAction: EnforcementAction =
              selectedActions[inc.id] ??
              (inc.actionTaken !== 'Pending' ? inc.actionTaken : 'Towed to Pound');

            return (
              <article
                key={inc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-slate-900">{inc.id}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="font-mono text-xs font-semibold text-[#0F4C81]">
                      {inc.vehicleNumber}
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-600">{inc.vehicleCategory}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <IncidentStatusLabel status={inc.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h2 className="font-display text-base font-bold text-slate-900">
                      {inc.roadName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigateToMapRoad(inc.roadId)}
                      className="text-xs font-medium text-[#0F4C81] hover:underline"
                    >
                      Inspect on Map
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inc.landmark}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">{inc.severity}</span>
                    <span aria-hidden="true">·</span>
                    <span>Reported {inc.reportedAt}</span>
                  </p>
                  <p className="text-xs text-slate-600">{inc.description}</p>
                </div>

                {inc.status !== 'Cleared' ? (
                  <div className="lg:w-[430px] shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 lg:pt-0 lg:pl-5 border-t lg:border-t-0 lg:border-l border-slate-200">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Assign Field Squad
                      </label>
                      <select
                        value={chosenUnit}
                        onChange={(e) =>
                          setSelectedUnits((prev) => ({ ...prev, [inc.id]: e.target.value }))
                        }
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.callSign} ({u.baseJunction} · {u.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Enforcement Action
                      </label>
                      <select
                        value={chosenAction}
                        onChange={(e) =>
                          setSelectedActions((prev) => ({
                            ...prev,
                            [inc.id]: e.target.value as EnforcementAction,
                          }))
                        }
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Towed to Pound">Towed to Pound</option>
                        <option value="Wheel Clamped">Wheel Clamped</option>
                        <option value="Patrol Warning">Patrol Warning</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatchUnitToIncident(inc.id, chosenUnit)}
                      className="px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {inc.assignedUnitId ? 'Re-Dispatch Unit' : 'Dispatch Unit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateIncidentProgress(inc.id, chosenAction, true)}
                      className="px-3 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Mark Road Cleared
                    </button>
                  </div>
                ) : (
                  <div className="lg:w-[260px] shrink-0 pt-3 lg:pt-0 lg:pl-5 border-t lg:border-t-0 lg:border-l border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-emerald-700">Resolved at {inc.clearedAt}</p>
                    <p className="text-slate-600">Action: {inc.actionTaken}</p>
                    <p className="text-slate-500">
                      Squad: {inc.assignedUnitName ?? 'Bidhannagar Patrol'}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
