export class CreateExpenseDto {
  projectId: string;
  type: string; // MATERIAL, LABOUR, TRANSPORT, MISC
  amount: number;
  date: string; // YYYY-MM-DD
}

export class UpdateExpenseDto {
  type?: string; // MATERIAL, LABOUR, TRANSPORT, MISC
  amount?: number;
  date?: string; // YYYY-MM-DD
}
