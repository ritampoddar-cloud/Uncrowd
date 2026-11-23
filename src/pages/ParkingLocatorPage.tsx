import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { LegalParkingZone } from '../types/system';

export function ParkingLocatorPage() {
  const {
    parkingZones,
    reservations,
    reserveParkingBay,
    navigateToMapParking,
  } = useSystem();

  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'covered' | 'ev'>('all');
  const [reservingZone, setReservingZone] = useState<LegalParkingZone | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('WB 06 N 4412');
  const [vehicleType, setVehicleType] = useState<'4-Wheeler' | '2-Wheeler'>('4-Wheeler');
  const [facilityImgFailed, setFacilityImgFailed] = useState(false);

  const filteredZones = parkingZones.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(query.toLowerCase()) ||
      zone.blockLocation.toLowerCase().includes(query.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'available') return zone.availableBays > 0 && zone.status !== 'Maintenance';
    if (filterMode === 'covered') return zone.covered;
    if (filterMode === 'ev') return zone.evChargers > 0;
    return true;
  });

  const handleConfirmReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingZone || !vehicleNumber.trim()) return;
    reserveParkingBay(reservingZone.id, vehicleNumber.trim(), vehicleType);
    setReservingZone(null);
  };

  const totalOpen4W = parkingZones.reduce((acc, z) => acc + z.availableBays, 0);
  const totalOpen2W = parkingZones.reduce((acc, z) => acc + z.twoWheelerBays, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Legal Parking Locator
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Direct commuters off No-Parking curbs into authorised NDITA multi-level, basement, and Metro park-and-ride facilities across Sector V.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">4-Wheeler Bays Open</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {totalOpen4W}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">2-Wheeler Bays Open</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {totalOpen2W}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Digital Passes</p>
              <p className="font-display text-2xl font-bold text-[#0F4C81] tabular-nums mt-0.5">
                {reservations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="relative flex-1 min-h-[160px] bg-slate-100">
            {!facilityImgFailed ? (
              <img
                src="/src/assets/images/smart_mlcp_parking_1795407321295.jpg"
                alt="Authorised multi-level civic parking facility in Sector V"
                referrerPolicy="no-referrer"
                onError={() => setFacilityImgFailed(true)}
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <Building2 className="w-7 h-7 text-[#0F4C81] mb-1.5" />
                <p className="text-xs font-semibold text-slate-800">Authorised MLCP &amp; Annex Network</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-4 text-white">
              <p className="text-xs text-slate-200">45-Minute Digital Hold Guarantee</p>
              <p className="text-sm font-semibold">Zero towing risk inside marked bays</p>
            </div>
          </div>
        </div>
      </div>

      {reservations.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-display text-sm font-semibold text-slate-900 mb-3">
            Your Active Parking Hold Passes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reservations.map((res) => (
              <div
                key={res.passCode}
                className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono">{res.passCode}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{res.zoneName}</p>
                  <p className="text-xs text-slate-600 font-mono">
                    {res.vehicleNumber} · {res.vehicleType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-500">Valid until</p>
                  <p className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {res.validUntil}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Sector V block, landmark, or lot name..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(
            [
              ['all', 'All Facilities'],
              ['available', 'Open Now'],
              ['covered', 'Covered / MLCP'],
              ['ev', 'EV Charging'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterMode(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterMode === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredZones.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900">No legal parking facilities match your filter</p>
          <p className="text-xs text-slate-500">Try clearing the search input or switching to All Facilities.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilterMode('all');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredZones.map((zone) => {
            const pct = Math.round((zone.availableBays / Math.max(1, zone.totalBays)) * 100);
            const isFull = zone.availableBays === 0 || zone.status === 'Maintenance';
            return (
              <article
                key={zone.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    {zone.facilityType} · {zone.walkingMinutesToHub} min walk to hub
                  </p>
                  <h2 className="font-display text-base font-bold text-slate-900">{zone.name}</h2>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{zone.blockLocation}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">4W Availability</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        isFull
                          ? 'text-red-700'
                          : pct < 20
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                      }`}
                    >
                      {zone.status} · {zone.availableBays}/{zone.totalBays} bays
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFull ? 'bg-red-500' : pct < 20 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      ₹{zone.hourlyRateInr}/hr
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{zone.twoWheelerBays} 2W bays</span>
                    {zone.evChargers > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Zap className="w-3 h-3" /> {zone.evChargers} EV
                        </span>
                      </>
                    )}
                    {zone.covered && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Covered
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {zone.openHours}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={() => setReservingZone(zone)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#0F4C81] text-white hover:bg-[#0B3B66]'
                    }`}
                  >
                    {isFull ? 'Currently Full' : 'Hold Bay Pass'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToMapParking(zone.id)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Locate on Map
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reservingZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReserve}
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-[#0F4C81]">45-Minute Digital Hold</p>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                {reservingZone.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{reservingZone.blockLocation}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. WB 06 N 4412"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vehicle Bay Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['4-Wheeler', '2-Wheeler'] as const).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setVehicleType(vt)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        vehicleType === vt
                          ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReservingZone(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-lg"
              >
                Confirm Bay Hold
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
