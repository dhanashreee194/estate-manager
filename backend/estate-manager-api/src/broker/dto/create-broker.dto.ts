export class CreateBrokerDto {
  name: string;
  phone: string;
  email?: string;
  panNumber?: string;
  address?: string;
  commissionRate: number;
}
