export class CreateLabourDto {
  name: string;
  category: string; // Mason, Helper, Carpenter
  dailyWage: number;
  vendorId?: string; // labour contractor / vendor
}

export class UpdateLabourDto {
  name?: string;
  category?: string;
  dailyWage?: number;
  vendorId?: string;
}
