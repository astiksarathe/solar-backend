import { Injectable } from '@nestjs/common';
import {
  LoanCalculationInput,
  LoanCalculationResult,
  LoanBreakdownEntry,
} from './emi-calculator.interface';

@Injectable()
export class EmiCalculatorService {
  calculateLoanWithPrepayments({
    loanAmount,
    annualRate,
    tenureMonths = null,
    emi = null,
    prepayments = [],
    mode = 'reduceTenure',
  }: LoanCalculationInput): LoanCalculationResult {
    const monthlyRate = annualRate / 12 / 100;

    // 🧮 Step 1: Calculate missing value (EMI or tenure)
    if (!emi && tenureMonths) {
      emi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    } else if (emi && !tenureMonths) {
      // Estimate tenure iteratively
      let tempPrincipal = loanAmount;
      let months = 0;

      while (tempPrincipal > 0 && months < 1000) {
        const interest = tempPrincipal * monthlyRate;
        const principal = emi - interest;
        if (principal <= 0)
          throw new Error('EMI too small for given interest rate.');
        tempPrincipal -= principal;
        months++;
      }
      tenureMonths = months;
    } else if (!emi && !tenureMonths) {
      throw new Error('Provide either EMI or tenureMonths.');
    }

    // 🧷 Ensure both are defined now
    const safeEMI = emi!;
    const safeTenure = tenureMonths!;

    // 🧾 Step 2: Initialize
    let remainingPrincipal = loanAmount;
    let totalInterest = 0;
    let currentEMI = safeEMI;
    const breakdown: LoanBreakdownEntry[] = [];
    let month = 0;

    // 🧩 Step 3: Month-by-month breakdown
    while (remainingPrincipal > 0 && month < 1000) {
      month++;

      const interest = remainingPrincipal * monthlyRate;
      let principal = currentEMI - interest;

      // Adjust for final month
      if (principal > remainingPrincipal) {
        principal = remainingPrincipal;
        currentEMI = principal + interest;
      }

      remainingPrincipal -= principal;
      totalInterest += interest;

      // 🏦 Step 4: Apply prepayment
      const prepay = prepayments.find((p) => p.month === month);
      let prepayAmount = 0;

      if (prepay) {
        prepayAmount = prepay.amount;
        remainingPrincipal -= prepayAmount;

        if (remainingPrincipal < 0) remainingPrincipal = 0;

        if (mode === 'reduceEMI' && remainingPrincipal > 0) {
          const remainingMonths = safeTenure - month;
          currentEMI =
            (remainingPrincipal *
              monthlyRate *
              Math.pow(1 + monthlyRate, remainingMonths)) /
            (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        }
      }

      breakdown.push({
        month,
        emi: currentEMI.toFixed(2),
        interest: interest.toFixed(2),
        principal: principal.toFixed(2),
        prepayment: prepayAmount.toFixed(2),
        remainingPrincipal: remainingPrincipal.toFixed(2),
      });

      if (remainingPrincipal <= 0) break;
    }

    // 🧮 Step 5: Totals
    const totalPaid = breakdown.reduce(
      (sum, r) => sum + parseFloat(r.emi) + parseFloat(r.prepayment),
      0,
    );

    return {
      loanAmount,
      annualRate,
      emi: safeEMI.toFixed(2),
      mode,
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalMonths: breakdown.length,
      breakdown,
    };
  }
}
