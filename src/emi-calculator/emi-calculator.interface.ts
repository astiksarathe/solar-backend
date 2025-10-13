export interface PrepaymentDetail {
  month: number;
  amount: number;
}

export interface LoanCalculationInput {
  loanAmount: number;
  annualRate: number;
  tenureMonths?: number | null;
  emi?: number | null;
  prepayments?: PrepaymentDetail[];
  mode?: 'reduceTenure' | 'reduceEMI';
}

export interface LoanBreakdownEntry {
  month: number;
  emi: string;
  interest: string;
  principal: string;
  prepayment: string;
  remainingPrincipal: string;
}

export interface LoanCalculationResult {
  loanAmount: number;
  annualRate: number;
  emi: string;
  mode: string;
  totalInterest: string;
  totalPaid: string;
  totalMonths: number;
  breakdown: LoanBreakdownEntry[];
}
