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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new lead',
    description: 'Create a new sales lead from consumer data or direct inquiry',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        consumerId: '507f1f77bcf86cd799439012',
        consumerNumber: 'CON-2024-0001',
        customerName: 'John Doe',
        phoneNumber: '+91-9876543210',
        emailAddress: 'john.doe@example.com',
        address: '123 Main Street, Delhi',
        status: 'new',
        priority: 'warm',
        interestLevel: 'interested',
        estimatedBudget: 500000,
        systemSize: '5kW',
        customerType: 'residential',
        assignedTo: '507f1f77bcf86cd799439013',
        createdBy: '507f1f77bcf86cd799439013',
        createdAt: '2024-12-15T10:30:00Z',
        updatedAt: '2024-12-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['consumerId must be a valid MongoDB ObjectId'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBody({
    type: CreateLeadDto,
    description: 'Lead creation data',
    examples: {
      residential: {
        summary: 'Residential Lead Example',
        value: {
          consumerId: '507f1f77bcf86cd799439012',
          consumerNumber: 'CON-2024-0001',
          leadSource: 'website',
          status: 'new',
          priority: 'warm',
          customerType: 'residential',
          estimatedValue: 500000,
          probability: 70,
          expectedCloseDate: '2024-12-31',
          requirementDescription: 'Looking for 5kW rooftop solar system',
          monthlyElectricityBill: 8000,
          propertyType: 'independent_house',
          roofCondition: 'good',
          hasShading: false,
          assignedTo: '507f1f77bcf86cd799439013',
          createdBy: '507f1f77bcf86cd799439013',
          notes: 'Customer is very interested and ready to proceed',
        },
      },
      commercial: {
        summary: 'Commercial Lead Example',
        value: {
          consumerId: '507f1f77bcf86cd799439014',
          consumerNumber: 'CON-2024-0002',
          leadSource: 'referral',
          status: 'contacted',
          priority: 'hot',
          customerType: 'commercial',
          estimatedValue: 2000000,
          probability: 85,
          expectedCloseDate: '2025-01-15',
          requirementDescription: 'Need 50kW solar system for office building',
          monthlyElectricityBill: 45000,
          propertyType: 'office_building',
          roofCondition: 'excellent',
          hasShading: false,
          assignedTo: '507f1f77bcf86cd799439013',
          createdBy: '507f1f77bcf86cd799439013',
          tags: ['high_value', 'urgent'],
        },
      },
    },
  })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all leads with filtering and pagination',
    description:
      'Retrieve leads with advanced filtering, search, and pagination capabilities',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'negotiation',
      'closed_won',
      'closed_lost',
    ],
    description: 'Filter by lead status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['cold', 'warm', 'hot'],
    description: 'Filter by lead priority',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: String,
    description: 'Filter by assigned user ID',
  })
  @ApiQuery({
    name: 'customerType',
    required: false,
    enum: ['residential', 'commercial', 'industrial'],
    description: 'Filter by customer type',
  })
  @ApiQuery({
    name: 'interestLevel',
    required: false,
    enum: [
      'not_interested',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
    ],
    description: 'Filter by interest level',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search across customer name, phone, email, address, notes',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction (default: desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            consumerId: {
              _id: '507f1f77bcf86cd799439012',
              name: 'John Doe',
              phone: '+91-9876543210',
              email: 'john.doe@example.com',
            },
            consumerNumber: 'CON-2024-0001',
            customerName: 'John Doe',
            phoneNumber: '+91-9876543210',
            status: 'qualified',
            priority: 'hot',
            interestLevel: 'very_interested',
            estimatedBudget: 500000,
            systemSize: '5kW',
            customerType: 'residential',
            assignedTo: {
              _id: '507f1f77bcf86cd799439013',
              name: 'Sales Agent',
              email: 'agent@company.com',
            },
            nextFollowUpDate: '2024-12-20T09:00:00Z',
            createdAt: '2024-12-15T10:30:00Z',
          },
        ],
        total: 150,
        page: 1,
        limit: 10,
        totalPages: 15,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll(@Query() query: QueryLeadDto) {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get lead statistics and analytics',
    description:
      'Retrieve comprehensive lead statistics including status distribution, priority breakdown, and customer type analytics',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: String,
    description: 'Filter statistics by assigned user ID',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Start date for statistics (ISO format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'End date for statistics (ISO format: YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead statistics retrieved successfully',
    schema: {
      example: {
        statusStats: [
          { _id: 'new', count: 45, totalValue: 2250000 },
          { _id: 'contacted', count: 32, totalValue: 1600000 },
          { _id: 'qualified', count: 28, totalValue: 1950000 },
          { _id: 'proposal_sent', count: 15, totalValue: 1125000 },
          { _id: 'negotiation', count: 8, totalValue: 720000 },
          { _id: 'closed_won', count: 12, totalValue: 1800000 },
          { _id: 'closed_lost', count: 6, totalValue: 0 },
        ],
        priorityStats: [
          { _id: 'cold', count: 35 },
          { _id: 'warm', count: 68 },
          { _id: 'hot', count: 43 },
        ],
        customerTypeStats: [
          { _id: 'residential', count: 89, avgBudget: 525000 },
          { _id: 'commercial', count: 42, avgBudget: 1250000 },
          { _id: 'industrial', count: 15, avgBudget: 2500000 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
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

    return this.leadsService.getLeadStats(assignedTo, dateRange);
  }

  @Get('follow-ups')
  @ApiOperation({
    summary: 'Get upcoming follow-ups',
    description:
      'Retrieve leads that require follow-up actions, sorted by due date',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: String,
    description: 'Filter follow-ups by assigned user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-ups retrieved successfully',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          consumerId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'John Doe',
            phone: '+91-9876543210',
            email: 'john.doe@example.com',
          },
          consumerNumber: 'CON-2024-0001',
          customerName: 'John Doe',
          status: 'contacted',
          priority: 'hot',
          nextFollowUpDate: '2024-12-16T09:00:00Z',
          assignedTo: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Sales Agent',
            email: 'agent@company.com',
          },
          estimatedBudget: 500000,
          notes: 'Customer wants to discuss financing options',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  getUpcomingFollowUps(@Query('assignedTo') assignedTo?: string) {
    return this.leadsService.getUpcomingFollowUps(assignedTo);
  }

  @Get('consumer/:consumerId')
  @ApiOperation({
    summary: 'Get leads by consumer ID',
    description: 'Retrieve all leads associated with a specific consumer',
  })
  @ApiParam({
    name: 'consumerId',
    type: String,
    description: 'Consumer ID to find leads for',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer leads retrieved successfully',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          consumerId: '507f1f77bcf86cd799439012',
          consumerNumber: 'CON-2024-0001',
          customerName: 'John Doe',
          status: 'qualified',
          priority: 'hot',
          assignedTo: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Sales Agent',
            email: 'agent@company.com',
          },
          createdAt: '2024-12-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findByConsumerId(@Param('consumerId') consumerId: string) {
    return this.leadsService.findByConsumerId(consumerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a lead by ID',
    description: 'Retrieve a specific lead with all populated references',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Lead ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead retrieved successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        consumerId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'John Doe',
          phone: '+91-9876543210',
          email: 'john.doe@example.com',
        },
        consumerNumber: 'CON-2024-0001',
        customerName: 'John Doe',
        phoneNumber: '+91-9876543210',
        emailAddress: 'john.doe@example.com',
        address: '123 Main Street, Delhi',
        status: 'qualified',
        priority: 'hot',
        interestLevel: 'very_interested',
        estimatedBudget: 500000,
        systemSize: '5kW',
        rooftopArea: 400,
        monthlyElectricityBill: 8000,
        customerType: 'residential',
        leadSource: 'website',
        assignedTo: {
          _id: '507f1f77bcf86cd799439013',
          name: 'Sales Agent',
          email: 'agent@company.com',
        },
        createdBy: {
          _id: '507f1f77bcf86cd799439013',
          name: 'Sales Agent',
          email: 'agent@company.com',
        },
        proposalDetails: {
          systemSize: '5kW',
          estimatedCost: 500000,
          paybackPeriod: 8,
          annualSavings: 60000,
          proposalDate: '2024-12-10T10:00:00Z',
          validUntil: '2024-12-25T23:59:59Z',
        },
        nextFollowUpDate: '2024-12-20T09:00:00Z',
        notes: 'Customer is very interested and ready to proceed',
        tags: ['high_priority', 'hot_lead'],
        createdAt: '2024-12-15T10:30:00Z',
        updatedAt: '2024-12-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lead with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a lead',
    description: 'Update lead information with partial data',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Lead ID to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateLeadDto,
    description: 'Lead update data',
    examples: {
      statusUpdate: {
        summary: 'Update Lead Status',
        value: {
          status: 'proposal_sent',
          priority: 'hot',
          nextFollowUp: '2024-12-25T10:00:00Z',
          notes: 'Proposal sent via email, waiting for customer response',
        },
      },
      proposalUpdate: {
        summary: 'Update Proposal Details',
        value: {
          proposalDetails: {
            systemSize: '7kW',
            estimatedCost: 650000,
            paybackPeriod: 7,
            annualSavings: 85000,
            proposalDate: '2024-12-15T10:00:00Z',
            validUntil: '2024-12-30T23:59:59Z',
          },
          status: 'proposal_sent',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        consumerId: '507f1f77bcf86cd799439012',
        status: 'proposal_sent',
        priority: 'hot',
        updatedAt: '2024-12-15T15:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/convert-to-order')
  @ApiOperation({
    summary: 'Convert lead to order',
    description:
      'Mark a lead as converted to order and link it with an order ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Lead ID to convert',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the created order',
          example: '507f1f77bcf86cd799439020',
        },
      },
      required: ['orderId'],
    },
    examples: {
      conversion: {
        summary: 'Convert Lead to Order',
        value: {
          orderId: '507f1f77bcf86cd799439020',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lead converted to order successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        consumerId: '507f1f77bcf86cd799439012',
        status: 'closed_won',
        orderId: '507f1f77bcf86cd799439020',
        convertedToOrderDate: '2024-12-15T16:00:00Z',
        updatedAt: '2024-12-15T16:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  convertToOrder(@Param('id') id: string, @Body('orderId') orderId: string) {
    return this.leadsService.convertToOrder(id, orderId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a lead',
    description: 'Permanently delete a lead from the system',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Lead ID to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead deleted successfully',
    schema: {
      example: {
        message: 'Lead deleted successfully',
        deletedId: '507f1f77bcf86cd799439011',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lead with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
