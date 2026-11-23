import { ArrowRight, CarFront, CheckCircle2, FileWarning, Map as MapIcon, ShieldAlert, Truck } from 'lucide-react';
import { useState } from 'react';
import { RoadStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';

export function OverviewPage() {
  const {
    roads,
    parkingZones,
    incidents,
    units,
    setCurrentPage,
    setActiveRole,
    navigateToMapRoad,
    navigateToReportRoad,
  } = useSystem();
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const clearRoads = roads.filter((r) => r.status === 'clear').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'Cleared');
  const totalAvailableBays = parkingZones.reduce((sum, z) => sum + z.availableBays, 0);
  const availableUnits = units.filter((u) => u.status === 'Available').length;
  const priorityCorridors = roads
    .slice()
    .sort((a, b) => b.activeObstructions - a.activeObstructions || a.avgSpeedKmh - b.avgSpeedKmh)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Bidhannagar Traffic Wing · NDITA Sector V, Salt Lake, Kolkata
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance leading-[1.15]">
              Keep Sector V IT corridors moving without roadside bottlenecks
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Clear Sector V connects daily commuters, Bidhannagar traffic enforcement squads, and NDITA zone administrators on one real-time grid—directing vehicles into authorised parking bays and clearing unauthorised curb obstructions fast.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage('road-map')}
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <MapIcon className="w-4 h-4" />
              Open Road Status Map
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('parking-locator')}
              className="px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <CarFront className="w-4 h-4" />
              Find Legal Parking
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('report-parking')}
              className="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <FileWarning className="w-4 h-4" />
              Report Illegal Parking
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="relative flex-1 min-h-[240px] bg-slate-100">
            {!heroImgFailed ? (
              <img
                src="/src/assets/images/sector_v_corridor_hero_1795407321417.jpg"
                alt="Clear multi-lane IT corridor in Salt Lake Sector V, Kolkata"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-100 to-sky-50">
                <MapIcon className="w-8 h-8 text-[#0F4C81] mb-2" />
                <p className="text-sm font-semibold text-slate-800">Sector V IT Corridor Network</p>
                <p className="text-xs text-slate-500 mt-1">Ring Road · Street 13 · Street 18 · Street 24</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-5 text-white">
              <p className="text-xs text-slate-200">Biswa Bangla Sarani · Morning Peak Window</p>
              <p className="font-display text-base font-semibold mt-0.5">
                {clearRoads} of {roads.length} primary corridors flowing clear
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Sector V key metrics">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Clear Corridors</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {clearRoads} / {roads.length}
          </p>
          <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Live GIS segment tracking
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Active Curb Obstructions</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {activeIncidents.length}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Unauthorised roadside vehicles queued
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Authorised 4W Bays Open</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalAvailableBays}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Across {parkingZones.length} Sector V facilities
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Enforcement Units Ready</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {availableUnits} / {units.length}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Avg. 14 min Sector V clearance SLA
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Corridor Congestion &amp; Curb Priority
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any corridor to inspect road obstructions on the live map or log a violation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('road-map')}
              className="text-xs font-medium text-[#0F4C81] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              Full Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-5">Corridor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Speed</th>
                  <th className="py-3 px-4 text-right">Obstructions</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {priorityCorridors.map((road) => (
                  <tr key={road.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5">
                      <p className="font-medium text-slate-900">{road.name}</p>
                      <p className="text-xs text-slate-500">
                        {road.corridorCode} · {road.blockArea}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <RoadStatusLabel status={road.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-slate-700">
                      {road.avgSpeedKmh} km/h
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-slate-900 font-semibold">
                      {road.activeObstructions}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigateToMapRoad(road.id)}
                          className="text-xs font-medium text-[#0F4C81] hover:underline whitespace-nowrap"
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToReportRoad(road.id)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Stakeholder Workspaces
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Jump straight to the operational pages designed for each Sector V user group
            </p>

            <div className="mt-4 divide-y divide-slate-200">
              <div className="py-3.5 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">Commuters &amp; Office Shuttles</span>
                  <CarFront className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Check blocked roads, hold an authorised bay pass, or report illegal roadside parking.
                </p>
                <div className="mt-2.5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('commuter');
                      setCurrentPage('parking-locator');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Parking Locator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('commuter');
                      setCurrentPage('report-parking');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Report Curb Block
                  </button>
                </div>
              </div>

              <div className="py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">Bidhannagar Traffic Authority</span>
                  <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Triage incidents, dispatch tow cranes, clear blocked lanes, and review congestion trends.
                </p>
                <div className="mt-2.5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('authority');
                      setCurrentPage('authority-dashboard');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Authority Console
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('authority');
                      setCurrentPage('clearance');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Clearance Queue
                  </button>
                </div>
              </div>

              <div className="py-3.5 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">NDITA System Administrators</span>
                  <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Manage Sector V parking capacity, no-parking clearway hours, and system audit records.
                </p>
                <div className="mt-2.5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('admin');
                      setCurrentPage('admin-zones');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Zone &amp; Rules Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('admin');
                      setCurrentPage('governance');
                    }}
                    className="text-xs font-medium text-[#0F4C81] hover:underline"
                  >
                    Roles &amp; Audit Log
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage('analytics')}
            className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-between"
          >
            <span>View Peak-Hour Traffic Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
