import { AlertTriangle, CheckCircle2, Clock, OctagonAlert } from 'lucide-react';
import { IncidentStatus, RoadStatus } from '../types/system';

export function RoadStatusLabel({ status }: { status: RoadStatus }) {
  if (status === 'clear') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Clear Flow
      </span>
    );
  }
  if (status === 'slow') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Slow Traffic
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
      <OctagonAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      Blocked Curb
    </span>
  );
}

export function IncidentStatusLabel({ status }: { status: IncidentStatus }) {
  if (status === 'Cleared') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Cleared
      </span>
    );
  }
  if (status === 'Clearing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Clearing
      </span>
    );
  }
  if (status === 'Dispatched') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Unit Dispatched
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      Reported
    </span>
  );
}
