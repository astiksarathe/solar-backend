import { Body, Controller, Post } from '@nestjs/common';
import { EmiCalculatorService } from './emi-calculator.service';
import * as emiCalculatorInterface from './emi-calculator.interface';

@Controller('emi-calculator')
export class EmiCalculatorController {
  constructor(private readonly emiCalculatorService: EmiCalculatorService) {}

  @Post()
  calculateLoan(
    @Body() input: emiCalculatorInterface.LoanCalculationInput,
  ): emiCalculatorInterface.LoanCalculationResult {
    return this.emiCalculatorService.calculateLoanWithPrepayments(input);
  }
}
