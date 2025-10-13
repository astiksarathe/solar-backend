import { Module } from '@nestjs/common';
import { EmiCalculatorService } from './emi-calculator.service';
import { EmiCalculatorController } from './emi-calculator.controller';

@Module({
  controllers: [EmiCalculatorController],
  providers: [EmiCalculatorService],
})
export class EmiCalculatorModule {}
