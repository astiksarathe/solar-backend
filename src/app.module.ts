import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmiCalculatorModule } from './emi-calculator/emi-calculator.module';
import { ElectricityBillModule } from './electricity-bill/electricity-bill.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [EmiCalculatorModule, ElectricityBillModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
