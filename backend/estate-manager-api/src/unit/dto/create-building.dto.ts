export class CreateBuildingDto {
  projectId: string;
  name: string;
  facing?: string;
}

export class UpdateBuildingDto {
  name: string;
  facing?: string;
}
export class AssignWingDto {
  wingId: string;
}
