export class CreateLabourDto {
  name: string;
  category: string; // Mason, Helper, Carpenter
  dailyWage: number;
}

export class UpdateLabourDto {
  name?: string;
  category?: string; // Mason, Helper, Carpenter
  dailyWage?: number;
}
