export interface MPCZBill {
  divName: string;
  tarrif: string;
  consumerNo: string;
  billMonth: string;
  billId: string;
  billDate: string;
  consumerName: string;
  address1: string;
  address2: string;
  address3: string;
  mobile: string;
  purpose: string;
  amount: string;
  consumption: string;
  dueDate: string;
  presentMeterReading: string | null;
}

export interface MPCZResponse {
  code: string;
  message: string;
  list: MPCZBill[];
  error: string | null;
}

export interface SolarRecommendation {
  consumerDetails: {
    name: string;
    consumerNo: string;
    address: string;
    mobile: string;
    purpose: string;
  };
  billAnalysis: {
    totalBills: number;
    last6MonthsData: MPCZBill[];
    averageConsumption: number;
    averageBill: number;
    totalConsumption: number;
    totalAmount: number;
  };
  solarRecommendation: {
    dailyRequirement: number;
    requiredSystemSize: number;
    recommendedSystemSize: number;
    reasonForRecommendation: string;
    savings: {
      monthlyBillSavings: number;
      annualSavings: number;
      paybackPeriod: number;
    };
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class MPCZError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'MPCZError';
  }
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  code?: string;
}
