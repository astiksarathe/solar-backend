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
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import {
  UpdateReminderDto,
  CompleteReminderDto,
  RescheduleReminderDto,
  AddCommunicationDto,
  AddDocumentDto,
  CustomerFeedbackDto,
} from './dto/update-reminder.dto';
import {
  QueryReminderDto,
  ReminderStatsQueryDto,
  UpcomingRemindersQueryDto,
  OverdueRemindersQueryDto,
} from './dto/query-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reminders')
@ApiBearerAuth('JWT-auth')
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  // === BASIC CRUD OPERATIONS ===

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiBody({ type: CreateReminderDto })
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(createReminderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reminders with advanced filtering and analytics',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by reminder type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    description: 'Filter by priority',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned user',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    description: 'Filter by related entity ID',
  })
  @ApiQuery({
    name: 'entityModel',
    required: false,
    description: 'Filter by entity type',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Filter from date',
  })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to date' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in title, description, notes',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Filter by tags (comma-separated)',
  })
  @ApiQuery({
    name: 'overdue',
    required: false,
    description: 'Show only overdue reminders',
  })
  @ApiQuery({
    name: 'dueToday',
    required: false,
    description: 'Show reminders due today',
  })
  @ApiQuery({
    name: 'isCritical',
    required: false,
    description: 'Filter by critical status',
  })
  @ApiQuery({
    name: 'weatherDependent',
    required: false,
    description: 'Filter weather-dependent reminders',
  })
  @ApiQuery({
    name: 'includeStats',
    required: false,
    description: 'Include summary statistics',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc/desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reminders with pagination and analytics',
  })
  findAll(@Query() query: QueryReminderDto) {
    return this.remindersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get comprehensive reminder statistics' })
  @ApiResponse({
    status: 200,
    description: 'Reminder statistics grouped by various metrics',
  })
  getStats(@Query() query: ReminderStatsQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;
    return this.remindersService.getReminderStats(
      query.assignedTo,
      fromDate,
      toDate,
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders with advanced filtering' })
  @ApiResponse({ status: 200, description: 'List of upcoming reminders' })
  getUpcomingReminders(@Query() query: UpcomingRemindersQueryDto) {
    return this.remindersService.getUpcomingReminders(
      query.assignedTo,
      query.days,
      query.limit,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue reminders with filtering options' })
  @ApiResponse({ status: 200, description: 'List of overdue reminders' })
  getOverdueReminders(@Query() query: OverdueRemindersQueryDto) {
    return this.remindersService.getOverdueReminders(
      query.assignedTo,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed reminder information by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'Detailed reminder information' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  findOne(@Param('id') id: string) {
    return this.remindersService.findOne(id);
  }

  // === COMMUNICATION MANAGEMENT ===

  @Post(':id/communication')
  @ApiOperation({ summary: 'Add communication record to reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: AddCommunicationDto })
  @ApiResponse({
    status: 201,
    description: 'Communication record added successfully',
  })
  addCommunication(
    @Param('id') id: string,
    @Body() communicationDto: AddCommunicationDto,
  ) {
    return this.remindersService.addCommunication(id, communicationDto);
  }

  @Get(':id/communication')
  @ApiOperation({ summary: 'Get communication history for reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'Communication history' })
  async getCommunicationHistory(@Param('id') id: string) {
    const reminder = await this.remindersService.findOne(id);
    return reminder.communicationHistory || [];
  }

  // === DOCUMENT MANAGEMENT ===

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add document to reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: AddDocumentDto })
  @ApiResponse({ status: 201, description: 'Document added successfully' })
  addDocument(@Param('id') id: string, @Body() documentDto: AddDocumentDto) {
    return this.remindersService.addDocument(id, documentDto);
  }

  // === COMPLETION AND QUALITY MANAGEMENT ===

  @Put(':id/complete')
  @ApiOperation({
    summary: 'Mark reminder as completed with outcome and quality rating',
  })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: CompleteReminderDto })
  @ApiResponse({ status: 200, description: 'Reminder completed successfully' })
  completeReminder(
    @Param('id') id: string,
    @Body() completeDto: CompleteReminderDto,
  ) {
    return this.remindersService.completeReminder(id, completeDto);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Add customer feedback to completed reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: CustomerFeedbackDto })
  @ApiResponse({
    status: 201,
    description: 'Customer feedback added successfully',
  })
  addCustomerFeedback(
    @Param('id') id: string,
    @Body() feedbackDto: CustomerFeedbackDto,
  ) {
    return this.remindersService.addCustomerFeedback(id, feedbackDto);
  }

  // === RESCHEDULING ===

  @Put(':id/reschedule')
  @ApiOperation({
    summary: 'Reschedule reminder with reason and history tracking',
  })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: RescheduleReminderDto })
  @ApiResponse({
    status: 200,
    description: 'Reminder rescheduled successfully',
  })
  rescheduleReminder(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleReminderDto,
  ) {
    return this.remindersService.rescheduleReminder(id, rescheduleDto);
  }

  // === LEGACY AND UTILITY ENDPOINTS ===

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder (general update)' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiBody({ type: UpdateReminderDto })
  update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, updateReminderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder and handle child reminders' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 204, description: 'Reminder deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }

  // === SEARCH AND FILTER ENDPOINTS ===

  @Get('search/advanced')
  @ApiOperation({
    summary: 'Advanced search with full-text and filter capabilities',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: 'JSON string of additional filters',
  })
  advancedSearch(
    @Query('q') searchQuery: string,
    @Query('filters') filters?: string,
  ) {
    const query: QueryReminderDto = { search: searchQuery };

    if (filters) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsedFilters = JSON.parse(filters);
        Object.assign(query, parsedFilters);
      } catch {
        // Ignore invalid JSON filters
      }
    }

    return this.remindersService.findAll(query);
  }

  // === DASHBOARD ENDPOINTS ===

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get reminder dashboard summary for user' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'User ID for personalized dashboard',
  })
  @ApiResponse({ status: 200, description: 'Dashboard summary data' })
  async getDashboardSummary(@Query('assignedTo') assignedTo?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [upcoming, overdue, stats] = await Promise.all([
      this.remindersService.getUpcomingReminders(assignedTo, 7, 10),
      this.remindersService.getOverdueReminders(assignedTo, 10),
      this.remindersService.getReminderStats(assignedTo),
    ]);

    return {
      upcoming,
      overdue,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stats,
      summary: {
        upcomingCount: upcoming.length,
        overdueCount: overdue.length,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        totalPending:
          stats.statusStats?.find((s: any) => s._id === 'pending')?.count || 0,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        totalCompleted:
          stats.statusStats?.find((s: any) => s._id === 'completed')?.count ||
          0,
      },
    };
  }
}
