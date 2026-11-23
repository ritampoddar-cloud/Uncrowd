import { useState } from 'react';
import { CheckCircle2, Plus, Settings2 } from 'lucide-react';
import { RoadStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';
import { LegalParkingZone, RoadStatus } from '../types/system';

export function AdminZonesPage() {
  const {
    roads,
    parkingZones,
    rules,
    updateRoadOverride,
    updateParkingZone,
    addParkingZone,
    toggleRule,
    addNoParkingRule,
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'corridors' | 'parking' | 'rules'>('corridors');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Add new parking form
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneBlock, setNewZoneBlock] = useState('');
  const [newZoneBays, setNewZoneBays] = useState(120);
  const [newZoneRate, setNewZoneRate] = useState(25);
  const [newZoneCorridor, setNewZoneCorridor] = useState(roads[0].id);

  // Add new rule form
  const [newRuleCorridor, setNewRuleCorridor] = useState('');
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleHours, setNewRuleHours] = useState('08:00 AM – 10:00 PM');
  const [newRuleFine, setNewRuleFine] = useState(1000);

  const flashNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleAddParking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneBlock.trim()) return;
    addParkingZone({
      name: newZoneName.trim(),
      blockLocation: newZoneBlock.trim(),
      corridorId: newZoneCorridor,
      facilityType: 'Surface Lot',
      totalBays: newZoneBays,
      availableBays: newZoneBays,
      twoWheelerBays: Math.round(newZoneBays * 0.6),
      evChargers: 4,
      covered: false,
      hourlyRateInr: newZoneRate,
      openHours: '07:00 AM – 10:30 PM',
      status: 'Open',
      mapX: 540,
      mapY: 205,
      walkingMinutesToHub: 3,
    });
    flashNotice(`Commissioned ${newZoneName.trim()} (${newZoneBays} bays) in Legal Parking Locator.`);
    setNewZoneName('');
    setNewZoneBlock('');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleCorridor.trim() || !newRuleTitle.trim()) return;
    addNoParkingRule({
      corridorName: newRuleCorridor.trim(),
      ruleTitle: newRuleTitle.trim(),
      hours: newRuleHours,
      fineInr: newRuleFine,
      towApplicable: true,
      active: true,
    });
    flashNotice(`Published enforcement rule: ${newRuleTitle.trim()}.`);
    setNewRuleCorridor('');
    setNewRuleTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Zone &amp; Parking Administration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            NDITA &amp; Bidhannagar administrative console to calibrate corridor rules, parking bay capacities, tariffs, and clearway schedules.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start md:self-auto">
          {(
            [
              ['corridors', `Corridors (${roads.length})`],
              ['parking', `Parking Lots (${parkingZones.length})`],
              ['rules', `No-Parking Rules (${rules.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {activeTab === 'corridors' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Sector V Corridor Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Override traffic flow status or update strict No-Parking enforcement windows
              </p>
            </div>
            <Settings2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Corridor</th>
                  <th className="py-3 px-4">Live Status</th>
                  <th className="py-3 px-4">Enforcement Window</th>
                  <th className="py-3 px-4">No-Parking Zone</th>
                  <th className="py-3 px-4 text-right">Status Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {roads.map((road) => (
                  <tr key={road.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{road.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {road.corridorCode} · {road.blockArea}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <RoadStatusLabel status={road.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-700">{road.enforcementWindow}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          updateRoadOverride(
                            road.id,
                            road.status,
                            !road.noParkingZone,
                            road.enforcementWindow,
                          );
                          flashNotice(`Updated No-Parking zoning on ${road.corridorCode}.`);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-medium border ${
                          road.noParkingZone
                            ? 'bg-sky-50 border-sky-200 text-[#0F4C81]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {road.noParkingZone ? 'Zero-Tolerance Active' : 'Regulated Curb'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={road.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as RoadStatus;
                          updateRoadOverride(
                            road.id,
                            nextStatus,
                            road.noParkingZone,
                            road.enforcementWindow,
                          );
                          flashNotice(
                            `Set ${road.corridorCode} map state to ${nextStatus.toUpperCase()}.`,
                          );
                        }}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="clear">Clear Flow</option>
                        <option value="slow">Slow Traffic</option>
                        <option value="blocked">Blocked Curb</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'parking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Authorised Parking Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Adjust hourly tariff, operating status, or release reserved capacity
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4 text-right">Available / Total</th>
                    <th className="py-3 px-4 text-right">Tariff (₹/hr)</th>
                    <th className="py-3 px-4 text-right">Operating State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {parkingZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{zone.name}</p>
                        <p className="text-[11px] text-slate-500">{zone.blockLocation}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                        {zone.availableBays} / {zone.totalBays}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={zone.hourlyRateInr}
                          onChange={(e) => {
                            const val = Math.max(10, Number(e.target.value) || 10);
                            updateParkingZone(zone.id, { hourlyRateInr: val });
                          }}
                          className="w-16 px-2 py-1 text-right font-mono tabular-nums border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={zone.status}
                          onChange={(e) => {
                            const nextState = e.target.value as LegalParkingZone['status'];
                            updateParkingZone(zone.id, { status: nextState });
                            flashNotice(`${zone.name} set to ${nextState}.`);
                          }}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="Open">Open</option>
                          <option value="Filling Fast">Filling Fast</option>
                          <option value="Full">Full</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <form
            onSubmit={handleAddParking}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-slate-900">
              Commission New Legal Lot
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Facility Name</label>
              <input
                type="text"
                required
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="e.g. Salt Lake SDF Annex Lot"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Block &amp; Landmark</label>
              <input
                type="text"
                required
                value={newZoneBlock}
                onChange={(e) => setNewZoneBlock(e.target.value)}
                placeholder="e.g. DN Block, Plot 14"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Connecting Corridor</label>
              <select
                value={newZoneCorridor}
                onChange={(e) => setNewZoneCorridor(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {roads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.corridorCode} — {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Bays</label>
                <input
                  type="number"
                  min={20}
                  max={1000}
                  value={newZoneBays}
                  onChange={(e) => setNewZoneBays(Number(e.target.value) || 50)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rate (₹/hr)</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={newZoneRate}
                  onChange={(e) => setNewZoneRate(Number(e.target.value) || 20)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Legal Parking Zone
            </button>
          </form>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
            {rules.map((rule) => (
              <div key={rule.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    {rule.corridorName} · {rule.hours}
                  </p>
                  <h3 className="font-display text-sm font-bold text-slate-900">{rule.ruleTitle}</h3>
                  <p className="text-xs text-slate-600 font-mono tabular-nums">
                    Penalty: ₹{rule.fineInr} · {rule.towApplicable ? 'Towing Authorised' : 'Clamp & Challan'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap self-start sm:self-auto ${
                    rule.active
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rule.active ? 'Directive Active' : 'Directive Paused'}
                </button>
              </div>
            ))}
          </section>

          <form
            onSubmit={handleAddRule}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-slate-900">
              Publish Clearway Directive
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Corridor Scope</label>
              <input
                type="text"
                required
                value={newRuleCorridor}
                onChange={(e) => setNewRuleCorridor(e.target.value)}
                placeholder="e.g. Street No. 18 Bus Corridor"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Directive Title</label>
              <input
                type="text"
                required
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                placeholder="e.g. Peak Shift Zero-Wait Zone"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Active Hours</label>
                <input
                  type="text"
                  value={newRuleHours}
                  onChange={(e) => setNewRuleHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fine (₹)</label>
                <input
                  type="number"
                  min={200}
                  step={100}
                  value={newRuleFine}
                  onChange={(e) => setNewRuleFine(Number(e.target.value) || 500)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Clearway Rule
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
