export class MarkAttendanceDto {
  labourId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
}

export class LabourAttendanceDto {
  labourId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  wageForDay: number;
}
