import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElectricityBillModule } from './electricity-bill/electricity-bill.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ElectricityBillModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
