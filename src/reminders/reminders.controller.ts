import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(createReminderDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.remindersService.findAll(query);
  }

  @Get('stats')
  getStats(
    @Query('assignedTo') assignedTo?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const dateRange =
      fromDate && toDate
        ? {
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
          }
        : undefined;

    return this.remindersService.getReminderStats(assignedTo, dateRange);
  }

  @Get('overdue')
  getOverdueReminders() {
    return this.remindersService.findOverdueReminders();
  }

  @Get('upcoming')
  getUpcomingReminders(
    @Query('assignedTo') assignedTo?: string,
    @Query('hours') hours?: string,
  ) {
    const hoursNumber = hours ? parseInt(hours) : 24;
    return this.remindersService.findUpcomingReminders(
      assignedTo,
      hoursNumber,
    );
  }

  @Get('assigned/:assignedTo')
  findByAssignedTo(@Param('assignedTo') assignedTo: string) {
    return this.remindersService.findByAssignedTo(assignedTo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.remindersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, updateReminderDto);
  }

  @Patch(':id/complete')
  markAsCompleted(@Param('id') id: string) {
    return this.remindersService.markAsCompleted(id);
  }

  @Patch(':id/snooze')
  snoozeReminder(
    @Param('id') id: string,
    @Body('snoozeMinutes') snoozeMinutes: number,
  ) {
    return this.remindersService.snoozeReminder(id, snoozeMinutes);
  }

  @Post('follow-up')
  createFollowUpReminder(
    @Body()
    followUpData: {
      relatedEntityId: string;
      entityType: 'consumer' | 'lead' | 'order';
      assignedTo: string;
      createdBy: string;
      followUpDays?: number;
    },
  ) {
    return this.remindersService.createFollowUpReminder(
      followUpData.relatedEntityId,
      followUpData.entityType,
      followUpData.assignedTo,
      followUpData.createdBy,
      followUpData.followUpDays,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }
}
