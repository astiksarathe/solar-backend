import { Module } from '@nestjs/common';
import { ElectricityBillService } from './electricity-bill.service';
import { ElectricityBillController } from './electricity-bill.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ElectricityBillController],
  providers: [ElectricityBillService],
})
export class ElectricityBillModule {}
