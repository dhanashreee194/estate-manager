export class InventoryInwardDto {
  projectId: string;
  materialId: string;
  quantity: number;
  vendorId?: string;
  unitCost?: number;
  invoiceNo?: string;
  remarks?: string;
}

