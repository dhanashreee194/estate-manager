export class CreateWingDto {
  buildingId: string;
  name: string;
  totalFloors: number;
  flatsPerFloor: number;
  hasLift: boolean;

  autoCreateFlats?: boolean;

  flatConfig?: {
    startFloor: number;
    endFloor: number;
    areaSqFt: number;
    basePrice: number;
    direction?: string;
    bhkType?: string; // e.g., '2BHK', '3BHK', '1BHK'
  };
}
