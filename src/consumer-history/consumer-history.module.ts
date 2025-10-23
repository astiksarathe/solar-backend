import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsumerHistoryService } from './consumer-history.service';
import { ConsumerHistoryController } from './consumer-history.controller';
import {
  ConsumerHistory,
  ConsumerHistorySchema,
} from './entities/consumer-history.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsumerHistory.name, schema: ConsumerHistorySchema },
    ]),
  ],
  controllers: [ConsumerHistoryController],
  providers: [ConsumerHistoryService],
  exports: [ConsumerHistoryService],
})
export class ConsumerHistoryModule {}
