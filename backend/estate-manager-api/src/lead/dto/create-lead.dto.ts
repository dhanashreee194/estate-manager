export class CreateLeadDto {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  budget?: number;
  requirement?: string;
  projectId?: string;
  assignedToId?: string;
  nextFollowUp?: Date;
  remarks?: string;
}
