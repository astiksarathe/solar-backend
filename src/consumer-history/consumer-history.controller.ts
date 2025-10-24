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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ConsumerHistoryService } from './consumer-history.service';
import { CreateConsumerHistoryDto } from './dto/create-consumer-history.dto';
import { UpdateConsumerHistoryDto } from './dto/update-consumer-history.dto';
import { QueryConsumerHistoryDto } from './dto/query-consumer-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  Audit,
  ComplianceAudit,
  NoAudit,
} from '../audit/decorators/audit.decorator';

@ApiTags('consumer-history')
@ApiBearerAuth()
@Controller('consumer-history')
@UseGuards(JwtAuthGuard)
export class ConsumerHistoryController {
  constructor(
    private readonly consumerHistoryService: ConsumerHistoryService,
  ) {}

  @Post()
  @Audit({
    entityType: 'ConsumerHistory',
    module: 'CONSUMER_HISTORY',
    category: 'DATA_CHANGE',
    priority: 'MEDIUM',
  })
  create(@Body() createConsumerHistoryDto: CreateConsumerHistoryDto) {
    return this.consumerHistoryService.create(createConsumerHistoryDto);
  }

  @Get()
  @NoAudit()
  findAll(@Query() query: QueryConsumerHistoryDto) {
    return this.consumerHistoryService.findAll(query);
  }

  @Get('stats')
  @NoAudit()
  getStats(
    @Query('consumerId') consumerId?: string,
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

    return this.consumerHistoryService.getInteractionStats(
      consumerId,
      dateRange,
    );
  }

  @Get('advanced-analytics')
  @ApiOperation({ summary: 'Get advanced analytics and insights' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter analytics by assigned user',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Start date for analytics',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'End date for analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Advanced analytics retrieved successfully',
  })
  getAdvancedAnalytics(
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

    return this.consumerHistoryService.getAdvancedAnalytics(assignedTo, dateRange);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming interactions' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned user',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead (default: 7)',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming interactions retrieved successfully',
  })
  getUpcoming(
    @Query('assignedTo') assignedTo?: string,
    @Query('days') days?: string,
  ) {
    return this.consumerHistoryService.getUpcomingInteractions(
      assignedTo,
      days ? parseInt(days) : 7,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue interactions' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned user',
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue interactions retrieved successfully',
  })
  getOverdue(@Query('assignedTo') assignedTo?: string) {
    return this.consumerHistoryService.getOverdueInteractions(assignedTo);
  }

  @Get('follow-ups-due')
  @ApiOperation({ summary: 'Get follow-ups that are due' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned user',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead (default: 7)',
  })
  @ApiResponse({
    status: 200,
    description: 'Due follow-ups retrieved successfully',
  })
  getFollowUpsDue(
    @Query('assignedTo') assignedTo?: string,
    @Query('days') days?: string,
  ) {
    return this.consumerHistoryService.getFollowUpsDue(
      assignedTo,
      days ? parseInt(days) : 7,
    );
  }

  @Get('consumer/:consumerId')
  @NoAudit()
  findByConsumerId(@Param('consumerId') consumerId: string) {
    return this.consumerHistoryService.findByConsumerId(consumerId);
  }

  @Get('consumer/:consumerId/summary')
  @ApiOperation({ summary: 'Get interaction summary for a specific consumer' })
  @ApiParam({
    name: 'consumerId',
    description: 'Consumer ID to get summary for',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer interaction summary retrieved successfully',
  })
  getConsumerSummary(@Param('consumerId') consumerId: string) {
    return this.consumerHistoryService.getConsumerInteractionSummary(consumerId);
  }

  @Get(':id')
  @NoAudit()
  findOne(@Param('id') id: string) {
    return this.consumerHistoryService.findOne(id);
  }

  @Patch(':id')
  @Audit({
    entityType: 'ConsumerHistory',
    module: 'CONSUMER_HISTORY',
    category: 'DATA_CHANGE',
    priority: 'MEDIUM',
  })
  update(
    @Param('id') id: string,
    @Body() updateConsumerHistoryDto: UpdateConsumerHistoryDto,
  ) {
    return this.consumerHistoryService.update(id, updateConsumerHistoryDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark interaction as completed with outcome data' })
  @ApiParam({
    name: 'id',
    description: 'Consumer history entry ID',
  })
  @ApiBody({
    description: 'Completion data',
    schema: {
      type: 'object',
      properties: {
        outcome: { 
          type: 'string', 
          enum: ['successful', 'needs_follow_up', 'rejected', 'postponed', 'converted', 'no_response', 'information_gathering'],
          description: 'Outcome of the interaction' 
        },
        notes: { type: 'string', description: 'Additional completion notes' },
        nextFollowUp: { type: 'string', format: 'date-time', description: 'Next follow-up date if needed' },
        interestLevel: { 
          type: 'string', 
          enum: ['not_interested', 'low_interest', 'interested', 'very_interested', 'ready_to_buy', 'needs_time', 'price_negotiation', 'comparing_options', 'budget_constraints'],
          description: 'Updated interest level' 
        },
        estimatedBudget: { type: 'number', description: 'Updated estimated budget' },
        updatedBy: { type: 'string', description: 'User ID who completed the interaction' },
      },
      required: ['updatedBy']
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Interaction marked as completed successfully',
  })
  completeInteraction(
    @Param('id') id: string,
    @Body() completionData: {
      outcome?: string;
      notes?: string;
      nextFollowUp?: string;
      interestLevel?: string;
      estimatedBudget?: number;
      updatedBy: string;
    },
  ) {
    return this.consumerHistoryService.completeInteraction(id, completionData);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an interaction' })
  @ApiParam({
    name: 'id',
    description: 'Consumer history entry ID',
  })
  @ApiBody({
    description: 'Reschedule data',
    schema: {
      type: 'object',
      properties: {
        newDate: { type: 'string', format: 'date-time', description: 'New scheduled date' },
        reason: { type: 'string', description: 'Reason for rescheduling' },
        updatedBy: { type: 'string', description: 'User ID who rescheduled' },
      },
      required: ['newDate', 'reason', 'updatedBy']
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Interaction rescheduled successfully',
  })
  rescheduleInteraction(
    @Param('id') id: string,
    @Body() rescheduleData: { newDate: string; reason: string; updatedBy: string },
  ) {
    return this.consumerHistoryService.rescheduleInteraction(
      id,
      rescheduleData.newDate,
      rescheduleData.reason,
      rescheduleData.updatedBy,
    );
  }

  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update status of multiple interactions' })
  @ApiBody({
    description: 'Bulk status update data',
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: 'Array of interaction IDs' },
        status: { 
          type: 'string', 
          enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
          description: 'New status for all interactions' 
        },
        updatedBy: { type: 'string', description: 'User ID performing the update' },
        notes: { type: 'string', description: 'Optional notes for the update' },
      },
      required: ['ids', 'status', 'updatedBy']
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk status update completed',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  bulkUpdateStatus(
    @Body() bulkData: { ids: string[]; status: string; updatedBy: string; notes?: string },
  ) {
    return this.consumerHistoryService.bulkUpdateStatus(
      bulkData.ids,
      bulkData.status,
      bulkData.updatedBy,
      bulkData.notes,
    );
  }

  @Delete(':id')
  @ComplianceAudit({
    entityType: 'ConsumerHistory',
    module: 'CONSUMER_HISTORY',
  })
  remove(@Param('id') id: string) {
    return this.consumerHistoryService.remove(id);
  }
}
