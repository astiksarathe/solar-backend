import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsumerDataService } from './consumer-data.service';
import { ConsumerDataController } from './consumer-data.controller';
import {
  ConsumerData,
  ConsumerDataSchema,
} from '../schemas/consumer-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsumerData.name, schema: ConsumerDataSchema },
    ]),
  ],
  controllers: [ConsumerDataController],
  providers: [ConsumerDataService],
  exports: [ConsumerDataService, MongooseModule],
})
export class ConsumerDataModule {}
