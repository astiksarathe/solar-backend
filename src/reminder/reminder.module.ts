import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { Reminder, ReminderSchema } from '../schemas/reminder.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
  ],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService, MongooseModule],
})
export class ReminderModule {}
