export class SolarProjectResponseDto {
  _id: string;
  name: string;
  consumerNumber: string;
  address: string;
  divisionName?: string;
  mobileNumber: string;
  purpose: string;
  amount?: number[];
  avgMonthlyBill?: number;
  propertyType?: string;
  status?: string;
  isConverted?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedSolarProjectResponseDto {
  data: SolarProjectResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
