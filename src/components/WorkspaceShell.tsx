import React, { useState } from 'react';
import {
  BarChart3,
  BookCheck,
  CarFront,
  ChevronRight,
  Compass,
  FileWarning,
  Map as MapIcon,
  Menu,
  Settings2,
  ShieldAlert,
  Truck,
  X,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { PageId, UserRole } from '../types/system';

interface NavItem {
  id: PageId;
  label: string;
  group: 'Command Overview' | 'Commuter Portal' | 'Authority Operations' | 'Administration';
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Sector V Overview', group: 'Command Overview', icon: Compass },
  { id: 'road-map', label: 'Road Status Map', group: 'Commuter Portal', icon: MapIcon },
  { id: 'parking-locator', label: 'Legal Parking Locator', group: 'Commuter Portal', icon: CarFront },
  { id: 'report-parking', label: 'Report Illegal Parking', group: 'Commuter Portal', icon: FileWarning },
  { id: 'authority-dashboard', label: 'Authority Dashboard', group: 'Authority Operations', icon: ShieldAlert },
  { id: 'clearance', label: 'Road Clearance', group: 'Authority Operations', icon: Truck },
  { id: 'analytics', label: 'Traffic Analytics', group: 'Authority Operations', icon: BarChart3 },
  { id: 'admin-zones', label: 'Zone & Parking Admin', group: 'Administration', icon: Settings2 },
  { id: 'governance', label: 'Roles & Audit Log', group: 'Administration', icon: BookCheck },
];

const GROUPS: NavItem['group'][] = [
  'Command Overview',
  'Commuter Portal',
  'Authority Operations',
  'Administration',
];

const ROLE_META: Record<UserRole, { label: string; org: string }> = {
  commuter: { label: 'Commuter', org: 'IT Park & Metro Travelers' },
  authority: { label: 'Traffic Authority', org: 'Bidhannagar Traffic Wing' },
  admin: { label: 'Administrator', org: 'NDITA Urban Mobility' },
};

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, activeRole, setActiveRole, incidents, parkingZones } =
    useSystem();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'Cleared').length;
  const openParkingCount = parkingZones.filter((z) => z.availableBays > 0).length;
  const currentMeta = NAV_ITEMS.find((item) => item.id === currentPage) ?? NAV_ITEMS[0];

  const handleNav = (id: PageId) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleNav('overview')}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 rounded"
        >
          <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
            CLEAR SECTOR V
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Salt Lake, Kolkata
          </span>
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70">
        <p className="text-xs font-medium text-slate-500 mb-2">Active Viewpoint</p>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-lg">
          {(['commuter', 'authority', 'admin'] as UserRole[]).map((role) => {
            const active = activeRole === role;
            const shortLabel = role === 'commuter' ? 'Commuter' : role === 'authority' ? 'Traffic' : 'Admin';
            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 truncate">{ROLE_META[activeRole].org}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Primary pages">
        {GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          return (
            <div key={group}>
              <p className="px-2.5 mb-1.5 text-[11px] font-semibold tracking-wide text-slate-500">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  const count =
                    item.id === 'authority-dashboard' || item.id === 'clearance'
                      ? activeIncidentsCount
                      : item.id === 'parking-locator'
                        ? openParkingCount
                        : null;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${
                          isActive
                            ? 'bg-[#0F4C81] text-white font-medium'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {count !== null && (
                          <span
                            className={`font-mono text-xs tabular-nums shrink-0 ${
                              isActive ? 'text-sky-100' : 'text-slate-500'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>NDITA · Bidhannagar Traffic</span>
          <span className="font-mono tabular-nums text-slate-700">9 Pages</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3.5 right-3 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={() => handleNav('overview')}
                className="text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 hidden sm:inline"
              >
                Clear Sector V
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" aria-hidden="true" />
              <span className="font-semibold text-slate-900 truncate">{currentMeta.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentPage !== 'report-parking' ? (
              <button
                type="button"
                onClick={() => handleNav('report-parking')}
                className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
              >
                Report Violation
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('road-map')}
                className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
              >
                View Road Map
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
