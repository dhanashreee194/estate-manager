export class CreateTaskDto {
  projectId: string;

  title: string;
  description?: string;

  status: string; // PENDING / IN_PROGRESS / DONE
  priority: string; // LOW / MEDIUM / HIGH

  dueDate?: Date;
}
