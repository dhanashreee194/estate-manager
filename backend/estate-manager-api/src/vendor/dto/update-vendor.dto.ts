export class UpdateVendorDto {
  name?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  type?: 'LABOUR' | 'MATERIAL' | 'BOTH';
  isActive?: boolean;
}
