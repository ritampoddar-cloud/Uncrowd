import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, FileWarning, MapPin, Upload } from 'lucide-react';
import { IncidentStatusLabel } from '../components/StatusText';
import { useSystem } from '../context/SystemContext';
import { ObstructionSeverity, VehicleCategory } from '../types/system';

export function ReportParkingPage() {
  const {
    roads,
    incidents,
    preselectedReportRoadId,
    setPreselectedReportRoadId,
    submitIncidentReport,
    navigateToMapRoad,
    setCurrentPage,
  } = useSystem();

  const [roadId, setRoadId] = useState(preselectedReportRoadId ?? roads[1].id);
  const [landmark, setLandmark] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('Sedan / SUV');
  const [severity, setSeverity] = useState<ObstructionSeverity>('Double Parked');
  const [reportedBy, setReportedBy] = useState('Commuter (Ritam P.)');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedReportRoadId) {
      setRoadId(preselectedReportRoadId);
      setPreselectedReportRoadId(null);
    }
  }, [preselectedReportRoadId, setPreselectedReportRoadId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim() || !vehicleNumber.trim()) return;
    const created = submitIncidentReport({
      roadId,
      landmark: landmark.trim(),
      vehicleNumber: vehicleNumber.trim(),
      vehicleCategory,
      severity,
      reportedBy,
      description:
        description.trim() ||
        `${vehicleCategory} parked illegally in active carriageway causing traffic delay.`,
      photoPreview,
    });
    setLastCreatedId(created.id);
    setLandmark('');
    setVehicleNumber('');
    setDescription('');
    setPhotoPreview(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Report Illegal Roadside Parking
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit unauthorised kerbside obstructions directly to Bidhannagar Traffic Wing and update the live Sector V road status map.
        </p>
      </div>

      {lastCreatedId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">
                Incident <span className="font-mono">{lastCreatedId}</span> logged to live enforcement queue
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                The affected corridor status has been updated on the Road Status Map and queued for nearest tow/clamp dispatch.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigateToMapRoad(roadId)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 whitespace-nowrap"
            >
              View on Map
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('clearance')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap"
            >
              Track in Clearance
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Sector V Corridor / Road Segment
              </label>
              <select
                value={roadId}
                onChange={(e) => setRoadId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
              >
                {roads.map((road) => (
                  <option key={road.id} value={road.id}>
                    {road.corridorCode} — {road.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nearest Landmark / Gate
              </label>
              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Outside Infinity Tower 1 Gate"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Vehicle Registration No.
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. WB 06 T 8821"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Vehicle Category
              </label>
              <select
                value={vehicleCategory}
                onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
              >
                <option value="Sedan / SUV">Sedan / SUV</option>
                <option value="Commercial Van">Commercial Van</option>
                <option value="Two-Wheeler">Two-Wheeler</option>
                <option value="Bus / Shuttle">Bus / Shuttle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Obstruction Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as ObstructionSeverity)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
              >
                <option value="Partial Lane">Partial Lane</option>
                <option value="Double Parked">Double Parked</option>
                <option value="Full Carriageway Block">Full Carriageway Block</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reporter Name / Patrol ID
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Congestion Impact Note
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lane blockage, queue length, or if hazard lights are unattended..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Evidence Attachment (Optional Photo)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <span className="text-xs text-emerald-700 inline-flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> Evidence attached
                  </span>
                )}
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Uploaded parking obstruction preview"
                  className="mt-3 h-32 w-auto rounded-lg border border-slate-200 object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Instant sync to Authority Dashboard &amp; GIS Map
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <FileWarning className="w-4 h-4" />
              Submit Parking Violation
            </button>
          </div>
        </form>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent Citizen &amp; Sensor Reports
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live status across Sector V enforcement queues
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums text-slate-600">
              {incidents.length} total
            </span>
          </div>

          <ul className="divide-y divide-slate-200 max-h-[560px] overflow-y-auto">
            {incidents.map((inc) => (
              <li key={inc.id} className="p-4 space-y-2 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {inc.id} · {inc.vehicleNumber}
                  </span>
                  <IncidentStatusLabel status={inc.status} />
                </div>
                <p className="text-xs font-medium text-slate-800">{inc.roadName}</p>
                <p className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{inc.landmark}</span>
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    {inc.severity} · {inc.reportedAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateToMapRoad(inc.roadId)}
                    className="text-[#0F4C81] font-medium hover:underline"
                  >
                    Inspect Corridor
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
