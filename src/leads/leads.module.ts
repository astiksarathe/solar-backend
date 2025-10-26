import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './entities/lead.entity';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    RemindersModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
