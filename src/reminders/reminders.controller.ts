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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { QueryReminderDto } from './dto/query-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reminders')
@ApiBearerAuth('JWT-auth')
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(createReminderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders with optional filtering' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by reminder type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'List of reminders with pagination' })
  findAll(@Query() query: QueryReminderDto) {
    return this.remindersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get reminder statistics' })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
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
  @ApiOperation({ summary: 'Get overdue reminders' })
  @ApiResponse({ status: 200, description: 'List of overdue reminders' })
  getOverdueReminders() {
    return this.remindersService.findOverdueReminders();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders' })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'hours', required: false })
  getUpcomingReminders(
    @Query('assignedTo') assignedTo?: string,
    @Query('hours') hours?: string,
  ) {
    const hoursNumber = hours ? parseInt(hours) : 24;
    return this.remindersService.findUpcomingReminders(assignedTo, hoursNumber);
  }

  @Get('assigned/:assignedTo')
  @ApiOperation({ summary: 'Get reminders assigned to a specific user' })
  @ApiParam({ name: 'assignedTo', description: 'User ID' })
  findByAssignedTo(@Param('assignedTo') assignedTo: string) {
    return this.remindersService.findByAssignedTo(assignedTo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'Reminder details' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
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
