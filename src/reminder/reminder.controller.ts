import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import {
  CreateReminderDto,
  UpdateReminderDto,
  CompleteReminderDto,
  RescheduleReminderDto,
  AddCommunicationDto,
  AddDocumentDto,
  CustomerFeedbackDto,
  QueryReminderDto,
  UpcomingRemindersQueryDto,
  OverdueRemindersQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reminder')
// @ApiBearerAuth('JWT-auth')
@Controller('reminder')
// @UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  // === CREATE ===
  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.reminderService.create(createReminderDto);
  }

  // === READ ALL ===
  @Get()
  @ApiOperation({
    summary: 'Get all reminders with filtering, sorting, pagination',
  })
  @ApiResponse({ status: 200, description: 'List of reminders' })
  findAll(@Query() query: QueryReminderDto) {
    return this.reminderService.findAll(query);
  }

  // === READ ONE ===
  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'Reminder details' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  findOne(@Param('id') id: string) {
    return this.reminderService.findOne(id);
  }

  // === UPDATE ===
  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder details' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: UpdateReminderDto })
  update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.reminderService.update(id, updateReminderDto);
  }

  // === COMPLETE ===
  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark reminder as completed' })
  @ApiBody({ type: CompleteReminderDto })
  complete(@Param('id') id: string, @Body() completeDto: CompleteReminderDto) {
    return this.reminderService.completeReminder(id, completeDto);
  }

  // === RESCHEDULE ===
  @Put(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a reminder' })
  @ApiBody({ type: RescheduleReminderDto })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleReminderDto,
  ) {
    return this.reminderService.rescheduleReminder(id, rescheduleDto);
  }

  // === COMMUNICATION ===
  @Post(':id/communication')
  @ApiOperation({ summary: 'Add communication to reminder' })
  @ApiBody({ type: AddCommunicationDto })
  addCommunication(@Param('id') id: string, @Body() dto: AddCommunicationDto) {
    return this.reminderService.addCommunication(id, dto);
  }

  // === DOCUMENT ===
  @Post(':id/documents')
  @ApiOperation({ summary: 'Attach document to reminder' })
  @ApiBody({ type: AddDocumentDto })
  addDocument(@Param('id') id: string, @Body() dto: AddDocumentDto) {
    return this.reminderService.addDocument(id, dto);
  }

  // === CUSTOMER FEEDBACK ===
  @Post(':id/feedback')
  @ApiOperation({ summary: 'Add customer feedback' })
  @ApiBody({ type: CustomerFeedbackDto })
  addFeedback(@Param('id') id: string, @Body() dto: CustomerFeedbackDto) {
    return this.reminderService.addCustomerFeedback(id, dto);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders' })
  getUpcoming(@Query() query: UpcomingRemindersQueryDto) {
    return this.reminderService.getUpcomingReminders(
      query.assignedTo,
      query.days,
      query.limit,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue reminders' })
  getOverdue(@Query() query: OverdueRemindersQueryDto) {
    return this.reminderService.getOverdueReminders(
      query.assignedTo,
      query.limit,
    );
  }

  // === DELETE ===
  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reminderService.remove(id);
  }
}
