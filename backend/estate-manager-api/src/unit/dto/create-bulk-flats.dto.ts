export class CreateBulkFlatsDto {
  projectId: string;
  wingId: string;

  startFloor: number;
  endFloor: number;
  flatsPerFloor: number;

  areaSqFt: number;
  basePrice: number;

  direction?: string;
  bhk?: number;
}
