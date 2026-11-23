import { useState } from 'react';
import {
  CarFront,
  Eye,
  FileWarning,
  Layers,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { IncidentStatusLabel, RoadStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';
import { RoadStatus } from '../types/system';

export function RoadMapPage() {
  const {
    roads,
    landmarks,
    parkingZones,
    incidents,
    units,
    selectedRoadId,
    setSelectedRoadId,
    selectedParkingId,
    setSelectedParkingId,
    navigateToReportRoad,
    setCurrentPage,
  } = useSystem();

  const [statusFilter, setStatusFilter] = useState<'all' | RoadStatus>('all');
  const [showParking, setShowParking] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [zoom, setZoom] = useState(1);

  const selectedRoad = roads.find((r) => r.id === selectedRoadId) ?? null;
  const selectedParking = parkingZones.find((p) => p.id === selectedParkingId) ?? null;
  const activeIncidents = incidents.filter((i) => i.status !== 'Cleared');

  const roadStroke = (status: RoadStatus) => {
    if (status === 'clear') return '#16A34A';
    if (status === 'slow') return '#D97706';
    return '#DC2626';
  };

  const visibleRoads =
    statusFilter === 'all' ? roads : roads.filter((r) => r.status === statusFilter);

  const roadIncidents = selectedRoad
    ? activeIncidents.filter((inc) => inc.roadId === selectedRoad.id)
    : [];

  const nearbyParking = selectedRoad
    ? parkingZones.filter((pz) => selectedRoad.nearestParkingIds.includes(pz.id))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interactive Road Status Map
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Live corridor traffic flow, illegal parking obstructions, legal parking facilities, and patrol positions across Sector V, Salt Lake.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(['all', 'clear', 'slow', 'blocked'] as const).map((tab) => {
              const label =
                tab === 'all' ? 'All Corridors' : tab === 'clear' ? 'Clear' : tab === 'slow' ? 'Slow' : 'Blocked';
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium mr-1">
                <Layers className="w-3.5 h-3.5" /> Layers:
              </span>
              <button
                type="button"
                onClick={() => setShowIncidents((v) => !v)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                  showIncidents
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                Illegal Parking ({activeIncidents.length})
              </button>
              <button
                type="button"
                onClick={() => setShowParking((v) => !v)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                  showParking
                    ? 'bg-sky-50 border-sky-200 text-[#0F4C81]'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                Legal Parking ({parkingZones.length})
              </button>
              <button
                type="button"
                onClick={() => setShowUnits((v) => !v)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                  showUnits
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                Clearance Units ({units.length})
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                aria-label="Zoom out map"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs tabular-nums px-2 text-slate-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                aria-label="Zoom in map"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 ml-1"
                aria-label="Reset map zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-auto bg-[#F1F5F9] p-2 sm:p-4">
            <div
              className="mx-auto transition-transform duration-150 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg
                viewBox="0 0 960 520"
                className="w-full h-auto min-w-[680px] rounded-lg bg-[#F8FAFC] border border-slate-200"
                role="img"
                aria-label="Interactive GIS map of Salt Lake Sector V road corridors and parking facilities"
              >
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                  </pattern>
                </defs>
                <rect width="960" height="520" fill="url(#grid)" />

                {/* Eastern Kestopur / Salt Lake Canal & IT Block Zones */}
                <path
                  d="M 0 65 Q 320 40 620 75 T 960 65 L 960 0 L 0 0 Z"
                  fill="#E0F2FE"
                  opacity="0.75"
                />
                <text x="480" y="34" textAnchor="middle" fill="#0369A1" fontSize="11" fontWeight="600">
                  Kestopur Canal · Northern Sector V Boundary
                </text>

                {/* Urban Block Footprints */}
                <g fill="#EEF2F6" stroke="#CBD5E1" strokeWidth="1">
                  <rect x="145" y="185" width="85" height="80" rx="6" />
                  <rect x="280" y="175" width="130" height="75" rx="6" />
                  <rect x="500" y="160" width="135" height="82" rx="6" />
                  <rect x="290" y="310" width="145" height="80" rx="6" />
                  <rect x="505" y="295" width="140" height="95" rx="6" />
                  <rect x="720" y="275" width="100" height="95" rx="6" />
                </g>

                <g fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">
                  <text x="187" y="228">AQ / EN</text>
                  <text x="345" y="216">AP / EP BLOCK</text>
                  <text x="567" y="205">BP / BN BLOCK</text>
                  <text x="362" y="352">GP BLOCK</text>
                  <text x="575" y="345">DN / DP BLOCK</text>
                  <text x="770" y="326">Y BLOCK</text>
                </g>

                {/* Road Corridors */}
                {roads.map((road) => {
                  const isVisible = statusFilter === 'all' || road.status === statusFilter;
                  const isSelected = selectedRoadId === road.id;
                  const color = roadStroke(road.status);
                  return (
                    <g
                      key={road.id}
                      onClick={() => {
                        setSelectedRoadId(road.id);
                        setSelectedParkingId(null);
                      }}
                      className="cursor-pointer"
                      opacity={isVisible ? 1 : 0.18}
                    >
                      {isSelected && (
                        <path
                          d={road.svgPath}
                          fill="none"
                          stroke="#0F4C81"
                          strokeWidth={18}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={0.22}
                        />
                      )}
                      <path
                        d={road.svgPath}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={12}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={road.svgPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={isSelected ? 7.5 : 5.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={road.status === 'blocked' ? '10 6' : undefined}
                      />
                      <rect
                        x={road.labelX - 31}
                        y={road.labelY - 11}
                        width="62"
                        height="20"
                        rx="4"
                        fill={isSelected ? '#0F4C81' : '#FFFFFF'}
                        stroke={isSelected ? '#0F4C81' : '#CBD5E1'}
                        strokeWidth="1"
                      />
                      <text
                        x={road.labelX}
                        y={road.labelY + 3}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="JetBrains Mono, monospace"
                        fill={isSelected ? '#FFFFFF' : '#0F172A'}
                      >
                        {road.corridorCode}
                      </text>
                    </g>
                  );
                })}

                {/* Landmarks */}
                {landmarks.map((lm) => (
                  <g key={lm.id} transform={`translate(${lm.x}, ${lm.y})`}>
                    <circle
                      r={lm.type === 'metro' ? 7 : 5.5}
                      fill="#FFFFFF"
                      stroke="#0F172A"
                      strokeWidth="2.5"
                    />
                    <text
                      y={-12}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="600"
                      fill="#0F172A"
                      style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: 3 }}
                    >
                      {lm.shortName}
                    </text>
                  </g>
                ))}

                {/* Legal Parking Facilities */}
                {showParking &&
                  parkingZones.map((zone) => {
                    const isSelected = selectedParkingId === zone.id;
                    const isFull = zone.availableBays === 0 || zone.status === 'Maintenance';
                    return (
                      <g
                        key={zone.id}
                        transform={`translate(${zone.mapX}, ${zone.mapY})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParkingId(zone.id);
                          setSelectedRoadId(null);
                        }}
                        className="cursor-pointer"
                      >
                        {isSelected && (
                          <circle r="17" fill="#0F4C81" opacity="0.2" />
                        )}
                        <rect
                          x="-12"
                          y="-12"
                          width="24"
                          height="24"
                          rx="6"
                          fill={isFull ? '#64748B' : '#0F4C81'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#FFFFFF"
                        >
                          P
                        </text>
                        <text
                          y="22"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="600"
                          fontFamily="JetBrains Mono, monospace"
                          fill="#0F4C81"
                          style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: 3 }}
                        >
                          {zone.availableBays} bays
                        </text>
                      </g>
                    );
                  })}

                {/* Illegal Parking Incidents */}
                {showIncidents &&
                  activeIncidents.map((inc) => (
                    <g
                      key={inc.id}
                      transform={`translate(${inc.mapX}, ${inc.mapY})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoadId(inc.roadId);
                        setSelectedParkingId(null);
                      }}
                      className="cursor-pointer"
                    >
                      <polygon
                        points="0,-12 11,9 -11,9"
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth="1.8"
                      />
                      <text y="5.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
                        !
                      </text>
                    </g>
                  ))}

                {/* Enforcement Units */}
                {showUnits &&
                  units.map((unit) => (
                    <g key={unit.id} transform={`translate(${unit.mapX}, ${unit.mapY})`}>
                      <rect
                        x="-14"
                        y="-9"
                        width="28"
                        height="18"
                        rx="4"
                        fill="#0F172A"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                      />
                      <text
                        y="3"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="JetBrains Mono, monospace"
                        fill="#FDE68A"
                      >
                        {unit.callSign.split('-')[0].slice(0, 3).toUpperCase()}
                      </text>
                    </g>
                  ))}
              </svg>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-1.5 rounded bg-emerald-600 inline-block" /> Clear Flow
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-1.5 rounded bg-amber-600 inline-block" /> Slow Traffic
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-1.5 rounded bg-red-600 inline-block" /> Blocked by Curb Parking
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-[#0F4C81]">
                <span className="w-4 h-4 rounded bg-[#0F4C81] text-white text-[10px] font-bold inline-flex items-center justify-center">
                  P
                </span>
                Legal Parking Bay
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-500">
              Showing {visibleRoads.length} of {roads.length} corridors
            </span>
          </div>
        </div>

        <aside className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {selectedParking ? (
            <>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#0F4C81]">Legal Parking Facility</p>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {selectedParking.name}
                </h2>
                <p className="text-xs text-slate-500">{selectedParking.blockLocation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200 text-sm">
                <div>
                  <p className="text-xs text-slate-500">4W Bays Open</p>
                  <p className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedParking.availableBays} / {selectedParking.totalBays}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hourly Tariff</p>
                  <p className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                    ₹{selectedParking.hourlyRateInr}/hr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">2W Bays Open</p>
                  <p className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedParking.twoWheelerBays}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Walk to Tech Hub</p>
                  <p className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedParking.walkingMinutesToHub} min
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage('parking-locator')}
                  className="w-full px-4 py-2.5 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CarFront className="w-4 h-4" />
                  Reserve Bay Pass in Locator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoadId(selectedParking.corridorId);
                    setSelectedParkingId(null);
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Inspect Connecting Corridor
                </button>
              </div>
            </>
          ) : selectedRoad ? (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-500">{selectedRoad.corridorCode}</span>
                  <RoadStatusLabel status={selectedRoad.status} />
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {selectedRoad.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedRoad.blockArea} · {selectedRoad.lanes} Lanes · {selectedRoad.lengthKm} km
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">Current Flow Speed</p>
                  <p className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedRoad.avgSpeedKmh} km/h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active Obstructions</p>
                  <p className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedRoad.activeObstructions}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Enforcement Rule</p>
                  <p className="text-xs font-medium text-slate-800 mt-0.5">
                    {selectedRoad.noParkingZone ? 'Strict No-Parking Zone' : 'Regulated Curb'} · {selectedRoad.enforcementWindow}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Active Roadside Incidents ({roadIncidents.length})
                </h3>
                {roadIncidents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No active unauthorised parking reports on this segment.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {roadIncidents.map((inc) => (
                      <li key={inc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-slate-900">{inc.vehicleNumber}</span>
                          <IncidentStatusLabel status={inc.status} />
                        </div>
                        <p className="text-slate-600">{inc.landmark}</p>
                        <p className="text-slate-500">{inc.severity} · Reported {inc.reportedAt}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Nearest Authorised Parking
                </h3>
                <ul className="space-y-1.5">
                  {nearbyParking.map((pz) => (
                    <li key={pz.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedParkingId(pz.id);
                          setSelectedRoadId(null);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-medium text-slate-800 truncate">{pz.name}</span>
                        <span className="font-mono tabular-nums text-[#0F4C81] shrink-0">
                          {pz.availableBays} open
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigateToReportRoad(selectedRoad.id)}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  Report Here
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage('clearance')}
                  className="px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Clearance Queue
                </button>
              </div>
            </>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Eye className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-900">Select a corridor or parking pin</p>
              <p className="text-xs text-slate-500">
                Click any road segment or blue P marker on the Sector V map to inspect status and actions.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Sector V Grid
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage('authority-dashboard')}
              className="text-[#0F4C81] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Authority View
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
