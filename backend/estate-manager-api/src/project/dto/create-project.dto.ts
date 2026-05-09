export class CreateProjectDto {
  name: string;
  location?: string;
  status: string;
}

export class UpdateProjectDto {
  name?: string;
  location?: string;
  status?: string;
}
