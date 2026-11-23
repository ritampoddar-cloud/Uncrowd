import { ArrowUpRight, BookCheck, CarFront, Settings2, ShieldAlert } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { UserRole } from '../types/system';

export function GovernancePage() {
  const { activeRole, setActiveRole, auditLogs, setCurrentPage } = useSystem();

  const roles: {
    id: UserRole;
    title: string;
    department: string;
    icon: React.ComponentType<{ className?: string }>;
    capabilities: string[];
    primaryEntry: { label: string; page: 'parking-locator' | 'authority-dashboard' | 'admin-zones' };
  }[] = [
    {
      id: 'commuter',
      title: 'Commuters & Fleet Operators',
      department: 'IT Park Staff, Shuttles & Visitors',
      icon: CarFront,
      capabilities: [
        'Inspect live corridor congestion across Sector V roads',
        'Search & hold 45-minute digital passes in legal parking bays',
        'Report unauthorised roadside parking with location & plate details',
      ],
      primaryEntry: { label: 'Open Parking Locator', page: 'parking-locator' },
    },
    {
      id: 'authority',
      title: 'Traffic Authorities',
      department: 'Bidhannagar Traffic Police & Tow Squads',
      icon: ShieldAlert,
      capabilities: [
        'Triage incoming citizen & sensor curb obstruction tickets',
        'Dispatch nearest cranes, tow vans, and clamping patrols',
        'Update enforcement action and restore corridor flow status',
      ],
      primaryEntry: { label: 'Open Authority Console', page: 'authority-dashboard' },
    },
    {
      id: 'admin',
      title: 'System Administrators',
      department: 'NDITA Urban Mobility Control',
      icon: Settings2,
      capabilities: [
        'Configure Sector V road corridor clearway hours & overrides',
        'Commission legal parking facilities and calibrate hourly tariffs',
        'Audit system events and export peak-hour congestion datasets',
      ],
      primaryEntry: { label: 'Open Zone Admin', page: 'admin-zones' },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          User Roles, Enforcement Policy &amp; Audit Log
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Role responsibilities across Sector V stakeholders, statutory towing tariffs, and live chronological action trail.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const Icon = role.icon;
          const isCurrent = activeRole === role.id;
          return (
            <article
              key={role.id}
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between gap-4 ${
                isCurrent ? 'border-[#0F4C81]' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">{role.department}</span>
                  <Icon className="w-4 h-4 text-[#0F4C81] shrink-0" />
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">{role.title}</h2>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                  {role.capabilities.map((cap) => (
                    <li key={cap}>{cap}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRole(role.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-[#0F4C81] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isCurrent ? 'Active Perspective' : 'Switch Role'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole(role.id);
                    setCurrentPage(role.primaryEntry.page);
                  }}
                  className="text-xs font-medium text-[#0F4C81] hover:underline inline-flex items-center gap-1"
                >
                  {role.primaryEntry.label} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Chronological System Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Every violation report, bay reservation, tow dispatch, and admin edit is recorded live
              </p>
            </div>
            <BookCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">ID / Time</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4 text-right">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {auditLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600 tabular-nums">
                      <span className="font-semibold text-slate-900">{entry.id}</span>
                      <span className="mx-1.5">·</span>
                      {entry.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {entry.actorLabel}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{entry.summary}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(entry.targetPage)}
                        className="text-xs font-medium text-[#0F4C81] hover:underline whitespace-nowrap"
                      >
                        Open Page
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Sector V Penalty &amp; Towing Tariff
          </h2>
          <p className="text-xs text-slate-500">
            Enforced under Motor Vehicles Act &amp; NDITA Salt Lake Clearway Notification
          </p>

          <dl className="divide-y divide-slate-200 text-xs">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <dt className="text-slate-700">Two-Wheeler Curb Encroachment</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">₹500</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <dt className="text-slate-700">Sedan / App-Cab No-Parking</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">₹1,000</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <dt className="text-slate-700">Double Parking + Wheel Clamp</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">₹1,500</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <dt className="text-slate-700">Heavy Shuttle / Crane Tow Charge</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">₹2,000</dd>
            </div>
          </dl>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            Vehicle Redemption Yard: Bidhannagar Traffic Pound, Near Karunamoyee Tank 9.
          </p>
        </section>
      </div>
    </div>
  );
}
