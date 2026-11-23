export type PageId =
  | 'overview'
  | 'road-map'
  | 'parking-locator'
  | 'report-parking'
  | 'clearance'
  | 'authority-dashboard'
  | 'analytics'
  | 'admin-zones'
  | 'governance';

export type UserRole = 'commuter' | 'authority' | 'admin';

export type RoadStatus = 'clear' | 'slow' | 'blocked';

export type VehicleCategory = 'Sedan / SUV' | 'Commercial Van' | 'Two-Wheeler' | 'Bus / Shuttle';

export type ObstructionSeverity = 'Partial Lane' | 'Double Parked' | 'Full Carriageway Block';

export type IncidentStatus = 'Reported' | 'Dispatched' | 'Clearing' | 'Cleared';

export type EnforcementAction = 'Pending' | 'Patrol Warning' | 'Wheel Clamped' | 'Towed to Pound';

export interface RoadSegment {
  id: string;
  name: string;
  corridorCode: string;
  blockArea: string;
  lengthKm: number;
  lanes: number;
  status: RoadStatus;
  avgSpeedKmh: number;
  freeFlowSpeedKmh: number;
  noParkingZone: boolean;
  enforcementWindow: string;
  activeObstructions: number;
  svgPath: string;
  labelX: number;
  labelY: number;
  nearestParkingIds: string[];
  notes: string;
}

export interface MapLandmark {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  type: 'junction' | 'metro' | 'tech-park';
}

export interface LegalParkingZone {
  id: string;
  name: string;
  blockLocation: string;
  corridorId: string;
  facilityType: 'Multi-Level (MLCP)' | 'Basement & Annex' | 'Surface Lot' | 'Metro Park & Ride';
  totalBays: number;
  availableBays: number;
  twoWheelerBays: number;
  evChargers: number;
  covered: boolean;
  hourlyRateInr: number;
  openHours: string;
  status: 'Open' | 'Filling Fast' | 'Full' | 'Maintenance';
  mapX: number;
  mapY: number;
  walkingMinutesToHub: number;
}

export interface ParkingReservation {
  passCode: string;
  zoneId: string;
  zoneName: string;
  vehicleNumber: string;
  vehicleType: '4-Wheeler' | '2-Wheeler';
  reservedAt: string;
  validUntil: string;
}

export interface IllegalParkingIncident {
  id: string;
  roadId: string;
  roadName: string;
  landmark: string;
  vehicleNumber: string;
  vehicleCategory: VehicleCategory;
  severity: ObstructionSeverity;
  status: IncidentStatus;
  actionTaken: EnforcementAction;
  assignedUnitId?: string;
  assignedUnitName?: string;
  reportedBy: string;
  reportedAt: string;
  etaMinutes?: number;
  clearedAt?: string;
  description: string;
  photoPreview?: string;
  mapX: number;
  mapY: number;
}

export interface EnforcementUnit {
  id: string;
  callSign: string;
  unitType: 'Heavy Tow Crane' | 'Light Tow Van' | 'Clamp & Patrol Bike' | 'Traffic Sergeant Squad';
  baseJunction: string;
  officerLead: string;
  status: 'Available' | 'En Route' | 'On Scene';
  activeIncidentId?: string;
  clearedToday: number;
  mapX: number;
  mapY: number;
}

export interface NoParkingRule {
  id: string;
  corridorName: string;
  ruleTitle: string;
  hours: string;
  fineInr: number;
  towApplicable: boolean;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorLabel: string;
  category: 'Report' | 'Clearance' | 'Parking' | 'Administration';
  summary: string;
  targetPage: PageId;
}
