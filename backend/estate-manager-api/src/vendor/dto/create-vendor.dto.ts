export class CreateVendorDto {
  name: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  type?: 'LABOUR' | 'MATERIAL' | 'BOTH';
}
