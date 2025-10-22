import { Module } from '@nestjs/common';
import { ConsumerDataService } from './consumer-data.service';
import { ConsumerDataController } from './consumer-data.controller';

@Module({
  controllers: [ConsumerDataController],
  providers: [ConsumerDataService],
})
export class ConsumerDataModule {}
