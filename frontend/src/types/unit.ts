export type UnitType = "PLOT" | "BUILDING" | "WING" | "FLAT";

export type UnitStatus = "AVAILABLE" | "BOOKED";

export interface Unit {
  id: string;
  projectId: string;
  type: UnitType;

  name: string; // Plot 12 / Building A / Wing B / Flat 301
  area?: number; // sq ft
  bhk?: number; // flats
  floor?: number; // flats
  direction?: string; // East / West
  parentUnitId?: string; // wing → building, flat → wing
  status: UnitStatus;
}
