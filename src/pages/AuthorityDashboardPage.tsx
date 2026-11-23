import { useState } from 'react';
import { ArrowRight, Search, ShieldAlert, Truck } from 'lucide-react';
import { IncidentStatusLabel, RoadStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';

export function AuthorityDashboardPage() {
  const {
    roads,
    incidents,
    units,
    dispatchUnitToIncident,
    setCurrentPage,
    navigateToMapRoad,
  } = useSystem();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Full Carriageway Block' | 'Double Parked' | 'Partial Lane'>('all');

  const activeIncidents = incidents.filter((i) => i.status !== 'Cleared');
  const filtered = activeIncidents.filter((i) => {
    const q = search.toLowerCase();
    const matchesQ =
      i.vehicleNumber.toLowerCase().includes(q) ||
      i.roadName.toLowerCase().includes(q) ||
      i.landmark.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q);
    if (!matchesQ) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    return true;
  });

  const handleQuickDispatch = (incidentId: string) => {
    const freeUnit = units.find((u) => u.status === 'Available') ?? units[0];
    dispatchUnitToIncident(incidentId, freeUnit.id);
  };

  const blockedRoads = roads.filter((r) => r.status === 'blocked').length;
  const totalClearedToday = units.reduce((sum, u) => sum + u.clearedToday, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Traffic Authority Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Bidhannagar Traffic Police &amp; NDITA Enforcement Wing — triage active curb violations and coordinate field tow squads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('clearance')}
          className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
        >
          Open Full Clearance Queue <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Unresolved Incidents</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {activeIncidents.length}
          </p>
          <p className="text-xs text-red-700 mt-1.5">
            {activeIncidents.filter((i) => i.status === 'Reported').length} awaiting unit dispatch
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Blocked Corridors</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {blockedRoads}
          </p>
          <p className="text-xs text-slate-600 mt-1.5">Corridors below 15 km/h flow</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Squads Available</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {units.filter((u) => u.status === 'Available').length} / {units.length}
          </p>
          <p className="text-xs text-slate-600 mt-1.5">Cranes, tow vans &amp; clamp bikes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Vehicles Cleared Today</p>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {totalClearedToday}
          </p>
          <p className="text-xs text-slate-600 mt-1.5">Fined, clamped, or towed</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plate, road, or incident ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">All Severities</option>
              <option value="Full Carriageway Block">Full Carriageway Block</option>
              <option value="Double Parked">Double Parked</option>
              <option value="Partial Lane">Partial Lane</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Incident / Plate</th>
                  <th className="py-3 px-4">Corridor &amp; Landmark</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No active incidents match your current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-mono font-semibold text-slate-900">{inc.vehicleNumber}</p>
                        <p className="font-mono text-[11px] text-slate-500">{inc.id} · {inc.reportedAt}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => navigateToMapRoad(inc.roadId)}
                          className="font-medium text-slate-900 hover:text-[#0F4C81] text-left"
                        >
                          {inc.roadName}
                        </button>
                        <p className="text-[11px] text-slate-500">{inc.landmark}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{inc.severity}</td>
                      <td className="py-3 px-4">
                        <IncidentStatusLabel status={inc.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inc.status === 'Reported' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickDispatch(inc.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-md whitespace-nowrap"
                          >
                            Dispatch Nearest
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentPage('clearance')}
                            className="text-xs font-medium text-[#0F4C81] hover:underline whitespace-nowrap"
                          >
                            {inc.assignedUnitName} · Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Field Enforcement Squads
              </h2>
              <Truck className="w-4 h-4 text-slate-400" />
            </div>

            <ul className="divide-y divide-slate-200 text-xs">
              {units.map((u) => (
                <li key={u.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      <span className="font-mono">{u.callSign}</span> · {u.unitType}
                    </p>
                    <p className="text-slate-500 truncate">
                      {u.officerLead} · Base: {u.baseJunction}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-medium ${
                        u.status === 'Available'
                          ? 'text-emerald-700'
                          : u.status === 'En Route'
                            ? 'text-amber-700'
                            : 'text-sky-700'
                      }`}
                    >
                      {u.status}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {u.clearedToday} cleared
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Corridor Bottleneck Watch
              </h2>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
            <ul className="divide-y divide-slate-200 text-xs">
              {roads
                .slice()
                .sort((a, b) => b.activeObstructions - a.activeObstructions)
                .slice(0, 4)
                .map((r) => (
                  <li key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigateToMapRoad(r.id)}
                      className="font-medium text-slate-800 hover:text-[#0F4C81] text-left truncate"
                    >
                      {r.corridorCode} · {r.name}
                    </button>
                    <RoadStatusLabel status={r.status} />
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
