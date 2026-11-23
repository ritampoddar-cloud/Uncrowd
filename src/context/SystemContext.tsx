import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_INCIDENTS,
  INITIAL_LANDMARKS,
  INITIAL_PARKING_ZONES,
  INITIAL_ROADS,
  INITIAL_RULES,
  INITIAL_UNITS,
} from '../data/sectorVData';
import {
  AuditLogEntry,
  EnforcementAction,
  EnforcementUnit,
  IllegalParkingIncident,
  LegalParkingZone,
  MapLandmark,
  NoParkingRule,
  ObstructionSeverity,
  PageId,
  ParkingReservation,
  RoadSegment,
  RoadStatus,
  UserRole,
  VehicleCategory,
} from '../types/system';

interface SystemContextValue {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  roads: RoadSegment[];
  landmarks: MapLandmark[];
  parkingZones: LegalParkingZone[];
  incidents: IllegalParkingIncident[];
  units: EnforcementUnit[];
  rules: NoParkingRule[];
  auditLogs: AuditLogEntry[];
  reservations: ParkingReservation[];
  selectedRoadId: string | null;
  setSelectedRoadId: (id: string | null) => void;
  selectedParkingId: string | null;
  setSelectedParkingId: (id: string | null) => void;
  preselectedReportRoadId: string | null;
  setPreselectedReportRoadId: (id: string | null) => void;
  navigateToMapRoad: (roadId: string) => void;
  navigateToMapParking: (parkingId: string) => void;
  navigateToReportRoad: (roadId: string) => void;
  submitIncidentReport: (payload: {
    roadId: string;
    landmark: string;
    vehicleNumber: string;
    vehicleCategory: VehicleCategory;
    severity: ObstructionSeverity;
    reportedBy: string;
    description: string;
    photoPreview?: string;
  }) => IllegalParkingIncident;
  dispatchUnitToIncident: (incidentId: string, unitId: string) => void;
  updateIncidentProgress: (incidentId: string, actionTaken: EnforcementAction, markCleared?: boolean) => void;
  reserveParkingBay: (zoneId: string, vehicleNumber: string, vehicleType: '4-Wheeler' | '2-Wheeler') => ParkingReservation | null;
  updateRoadOverride: (roadId: string, status: RoadStatus, noParkingZone: boolean, enforcementWindow: string) => void;
  updateParkingZone: (zoneId: string, updates: Partial<LegalParkingZone>) => void;
  addParkingZone: (zone: Omit<LegalParkingZone, 'id'>) => void;
  toggleRule: (ruleId: string) => void;
  addNoParkingRule: (rule: Omit<NoParkingRule, 'id'>) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [activeRole, setActiveRole] = useState<UserRole>('commuter');
  const [roads, setRoads] = useState<RoadSegment[]>(INITIAL_ROADS);
  const [landmarks] = useState<MapLandmark[]>(INITIAL_LANDMARKS);
  const [parkingZones, setParkingZones] = useState<LegalParkingZone[]>(INITIAL_PARKING_ZONES);
  const [incidents, setIncidents] = useState<IllegalParkingIncident[]>(INITIAL_INCIDENTS);
  const [units, setUnits] = useState<EnforcementUnit[]>(INITIAL_UNITS);
  const [rules, setRules] = useState<NoParkingRule[]>(INITIAL_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [reservations, setReservations] = useState<ParkingReservation[]>([]);

  const [selectedRoadId, setSelectedRoadId] = useState<string | null>('rd-street-13');
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null);
  const [preselectedReportRoadId, setPreselectedReportRoadId] = useState<string | null>(null);

  const appendAudit = (
    actorRole: UserRole,
    actorLabel: string,
    category: AuditLogEntry['category'],
    summary: string,
    targetPage: PageId,
  ) => {
    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(905 + prev.length)}`,
        timestamp: formatCurrentTime(),
        actorRole,
        actorLabel,
        category,
        summary,
        targetPage,
      },
      ...prev,
    ]);
  };

  const recalculateRoadState = (roadId: string, nextIncidents: IllegalParkingIncident[]) => {
    const activeForRoad = nextIncidents.filter((inc) => inc.roadId === roadId && inc.status !== 'Cleared');
    setRoads((prev) =>
      prev.map((road) => {
        if (road.id !== roadId) return road;
        const count = activeForRoad.length;
        const hasFullBlock = activeForRoad.some((i) => i.severity !== 'Partial Lane');
        let nextStatus: RoadStatus = 'clear';
        let nextSpeed = road.freeFlowSpeedKmh - 4;
        if (count >= 2 || hasFullBlock) {
          nextStatus = 'blocked';
          nextSpeed = Math.max(8, Math.round(road.freeFlowSpeedKmh * 0.28));
        } else if (count === 1) {
          nextStatus = 'slow';
          nextSpeed = Math.round(road.freeFlowSpeedKmh * 0.52);
        }
        return {
          ...road,
          activeObstructions: count,
          status: nextStatus,
          avgSpeedKmh: nextSpeed,
        };
      }),
    );
  };

  const navigateToMapRoad = (roadId: string) => {
    setSelectedRoadId(roadId);
    setSelectedParkingId(null);
    setCurrentPage('road-map');
  };

  const navigateToMapParking = (parkingId: string) => {
    setSelectedParkingId(parkingId);
    setSelectedRoadId(null);
    setCurrentPage('road-map');
  };

  const navigateToReportRoad = (roadId: string) => {
    setPreselectedReportRoadId(roadId);
    setCurrentPage('report-parking');
  };

  const submitIncidentReport: SystemContextValue['submitIncidentReport'] = (payload) => {
    const targetRoad = roads.find((r) => r.id === payload.roadId) ?? roads[0];
    const nextNumber = 2609 + incidents.length;
    const newIncident: IllegalParkingIncident = {
      id: `INC-${nextNumber}`,
      roadId: targetRoad.id,
      roadName: targetRoad.name,
      landmark: payload.landmark,
      vehicleNumber: payload.vehicleNumber.toUpperCase(),
      vehicleCategory: payload.vehicleCategory,
      severity: payload.severity,
      status: 'Reported',
      actionTaken: 'Pending',
      reportedBy: payload.reportedBy.trim() || 'Commuter Portal User',
      reportedAt: formatCurrentTime(),
      description: payload.description,
      photoPreview: payload.photoPreview,
      mapX: targetRoad.labelX + ((incidents.length % 3) - 1) * 14,
      mapY: targetRoad.labelY + ((incidents.length % 2 === 0 ? 1 : -1) * 12),
    };

    const nextIncidents = [newIncident, ...incidents];
    setIncidents(nextIncidents);
    recalculateRoadState(targetRoad.id, nextIncidents);
    appendAudit(
      activeRole,
      newIncident.reportedBy,
      'Report',
      `Logged ${newIncident.id} (${newIncident.vehicleNumber}) on ${targetRoad.corridorCode} — ${newIncident.severity}.`,
      'report-parking',
    );
    return newIncident;
  };

  const dispatchUnitToIncident = (incidentId: string, unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const incident = incidents.find((i) => i.id === incidentId);
    if (!unit || !incident) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'Dispatched',
              assignedUnitId: unit.id,
              assignedUnitName: unit.callSign,
              etaMinutes: 5,
            }
          : inc,
      ),
    );

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status: 'En Route',
            activeIncidentId: incidentId,
            mapX: incident.mapX - 18,
            mapY: incident.mapY + 10,
          };
        }
        if (u.activeIncidentId === incidentId && u.id !== unitId) {
          return { ...u, status: 'Available', activeIncidentId: undefined };
        }
        return u;
      }),
    );

    appendAudit(
      'authority',
      unit.officerLead,
      'Clearance',
      `Dispatched ${unit.callSign} (${unit.unitType}) to ${incident.id} on ${incident.roadName}.`,
      'clearance',
    );
  };

  const updateIncidentProgress = (
    incidentId: string,
    actionTaken: EnforcementAction,
    markCleared = false,
  ) => {
    const target = incidents.find((i) => i.id === incidentId);
    if (!target) return;

    const nextIncidents = incidents.map((inc) => {
      if (inc.id !== incidentId) return inc;
      return {
        ...inc,
        actionTaken,
        status: markCleared ? ('Cleared' as const) : ('Clearing' as const),
        clearedAt: markCleared ? formatCurrentTime() : inc.clearedAt,
        etaMinutes: markCleared ? 0 : 2,
      };
    });

    setIncidents(nextIncidents);

    if (target.assignedUnitId) {
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id !== target.assignedUnitId) return u;
          if (markCleared) {
            return {
              ...u,
              status: 'Available',
              activeIncidentId: undefined,
              clearedToday: u.clearedToday + 1,
            };
          }
          return { ...u, status: 'On Scene', mapX: target.mapX, mapY: target.mapY };
        }),
      );
    }

    if (markCleared) {
      recalculateRoadState(target.roadId, nextIncidents);
      appendAudit(
        'authority',
        target.assignedUnitName ? `Unit ${target.assignedUnitName}` : 'Traffic Authority',
        'Clearance',
        `Cleared ${target.id} (${actionTaken}); recalculated road flow on ${target.roadName}.`,
        'road-map',
      );
    } else {
      appendAudit(
        'authority',
        target.assignedUnitName ? `Unit ${target.assignedUnitName}` : 'Traffic Authority',
        'Clearance',
        `Updated ${target.id} enforcement status to Clearing (${actionTaken}).`,
        'clearance',
      );
    }
  };

  const reserveParkingBay: SystemContextValue['reserveParkingBay'] = (
    zoneId,
    vehicleNumber,
    vehicleType,
  ) => {
    const zone = parkingZones.find((z) => z.id === zoneId);
    if (!zone || zone.status === 'Maintenance') return null;
    if (vehicleType === '4-Wheeler' && zone.availableBays <= 0) return null;
    if (vehicleType === '2-Wheeler' && zone.twoWheelerBays <= 0) return null;

    setParkingZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const nextAvail = vehicleType === '4-Wheeler' ? Math.max(0, z.availableBays - 1) : z.availableBays;
        const nextTwo = vehicleType === '2-Wheeler' ? Math.max(0, z.twoWheelerBays - 1) : z.twoWheelerBays;
        const ratio = nextAvail / Math.max(1, z.totalBays);
        const nextStatus =
          nextAvail === 0 ? 'Full' : ratio < 0.18 ? 'Filling Fast' : 'Open';
        return {
          ...z,
          availableBays: nextAvail,
          twoWheelerBays: nextTwo,
          status: z.status === 'Maintenance' ? 'Maintenance' : nextStatus,
        };
      }),
    );

    const passCode = `CSV-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const valid = new Date(now.getTime() + 45 * 60000);
    const reservation: ParkingReservation = {
      passCode,
      zoneId: zone.id,
      zoneName: zone.name,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      reservedAt: formatCurrentTime(),
      validUntil: valid.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).toUpperCase(),
    };

    setReservations((prev) => [reservation, ...prev]);
    appendAudit(
      'commuter',
      vehicleNumber.toUpperCase(),
      'Parking',
      `Issued legal bay hold pass ${passCode} at ${zone.name} (${vehicleType}).`,
      'parking-locator',
    );
    return reservation;
  };

  const updateRoadOverride: SystemContextValue['updateRoadOverride'] = (
    roadId,
    status,
    noParkingZone,
    enforcementWindow,
  ) => {
    setRoads((prev) =>
      prev.map((r) => {
        if (r.id !== roadId) return r;
        const speed =
          status === 'clear'
            ? r.freeFlowSpeedKmh - 3
            : status === 'slow'
              ? Math.round(r.freeFlowSpeedKmh * 0.52)
              : Math.round(r.freeFlowSpeedKmh * 0.25);
        return { ...r, status, avgSpeedKmh: speed, noParkingZone, enforcementWindow };
      }),
    );
    const road = roads.find((r) => r.id === roadId);
    appendAudit(
      'admin',
      'NDITA Traffic Admin',
      'Administration',
      `Updated corridor ${road?.corridorCode ?? roadId}: status set to ${status.toUpperCase()}, window "${enforcementWindow}".`,
      'admin-zones',
    );
  };

  const updateParkingZone: SystemContextValue['updateParkingZone'] = (zoneId, updates) => {
    setParkingZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)),
    );
    const target = parkingZones.find((z) => z.id === zoneId);
    appendAudit(
      'admin',
      'NDITA Parking Admin',
      'Administration',
      `Modified ${target?.name ?? zoneId} parameters (${Object.keys(updates).join(', ')}).`,
      'admin-zones',
    );
  };

  const addParkingZone: SystemContextValue['addParkingZone'] = (zone) => {
    const newZone: LegalParkingZone = {
      ...zone,
      id: `pk-custom-${parkingZones.length + 1}`,
    };
    setParkingZones((prev) => [newZone, ...prev]);
    appendAudit(
      'admin',
      'NDITA Parking Admin',
      'Administration',
      `Commissioned new authorised parking facility: ${newZone.name} (${newZone.totalBays} bays).`,
      'parking-locator',
    );
  };

  const toggleRule = (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r)));
    if (target) {
      appendAudit(
        'admin',
        'NDITA Policy Admin',
        'Administration',
        `${target.active ? 'Paused' : 'Activated'} enforcement rule: ${target.ruleTitle}.`,
        'admin-zones',
      );
    }
  };

  const addNoParkingRule: SystemContextValue['addNoParkingRule'] = (rule) => {
    const newRule: NoParkingRule = {
      ...rule,
      id: `rule-${rules.length + 1}`,
    };
    setRules((prev) => [newRule, ...prev]);
    appendAudit(
      'admin',
      'NDITA Policy Admin',
      'Administration',
      `Published new corridor directive: ${newRule.ruleTitle} (${newRule.corridorName}).`,
      'admin-zones',
    );
  };

  return (
    <SystemContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        activeRole,
        setActiveRole,
        roads,
        landmarks,
        parkingZones,
        incidents,
        units,
        rules,
        auditLogs,
        reservations,
        selectedRoadId,
        setSelectedRoadId,
        selectedParkingId,
        setSelectedParkingId,
        preselectedReportRoadId,
        setPreselectedReportRoadId,
        navigateToMapRoad,
        navigateToMapParking,
        navigateToReportRoad,
        submitIncidentReport,
        dispatchUnitToIncident,
        updateIncidentProgress,
        reserveParkingBay,
        updateRoadOverride,
        updateParkingZone,
        addParkingZone,
        toggleRule,
        addNoParkingRule,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used inside SystemProvider');
  return ctx;
}
