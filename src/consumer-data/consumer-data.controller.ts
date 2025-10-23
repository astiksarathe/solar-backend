import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  ParseArrayPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ConsumerDataService } from './consumer-data.service';
import { CreateConsumerDataDto } from './dto/create-consumer-data.dto';
import { UpdateConsumerDataDto } from './dto/update-consumer-data.dto';
import { QueryConsumerDataDto } from './dto/query-consumer-data.dto';
import {
  ConsumerDataResponseDto,
  PaginatedConsumerDataResponseDto,
  BulkOperationResponseDto,
  ConsumerDataStatsResponseDto,
} from './dto/consumer-data-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Consumer Data')
@Controller('consumer-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsumerDataController {
  constructor(private readonly consumerDataService: ConsumerDataService) {}

  /**
   * Create a new consumer data record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new consumer data',
    description:
      'Create a new consumer data record from scraped or manual data',
  })
  @ApiResponse({
    status: 201,
    description: 'Consumer data created successfully',
    type: ConsumerDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or duplicate consumer number',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async create(
    @Body() createConsumerDataDto: CreateConsumerDataDto,
  ): Promise<ConsumerDataResponseDto> {
    return this.consumerDataService.create(createConsumerDataDto);
  }

  /**
   * Create multiple consumer data records in bulk
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk create consumer data',
    description: 'Create multiple consumer data records in a single operation',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk operation completed',
    type: BulkOperationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiBody({
    description: 'Array of consumer data to create',
    type: [CreateConsumerDataDto],
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createBulk(
    @Body(new ParseArrayPipe({ items: CreateConsumerDataDto }))
    createConsumerDataDtos: CreateConsumerDataDto[],
  ): Promise<BulkOperationResponseDto> {
    return this.consumerDataService.createBulk(createConsumerDataDtos);
  }

  /**
   * Get all consumer data with advanced filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get all consumer data',
    description:
      'Retrieve consumer data with advanced filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer data retrieved successfully',
    type: PaginatedConsumerDataResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Search across name, consumer number, mobile number, and address',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
    description: 'Filter by processing status',
  })
  @ApiQuery({
    name: 'propertyType',
    required: false,
    enum: [
      'residential',
      'commercial',
      'agricultural',
      'industrial',
      'unknown',
    ],
    description: 'Filter by property type',
  })
  @ApiQuery({
    name: 'isHighConsumer',
    required: false,
    type: Boolean,
    description: 'Filter high consumption customers only',
  })
  @ApiQuery({
    name: 'potentialLeadsOnly',
    required: false,
    type: Boolean,
    description: 'Include only potential leads (high qualification score)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'createdAt',
      'updatedAt',
      'name',
      'avgUnits',
      'avgMonthlyBill',
      'qualificationScore',
      'estimatedSolarCapacity',
    ],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async findAll(
    @Query() queryDto: QueryConsumerDataDto,
  ): Promise<PaginatedConsumerDataResponseDto> {
    return this.consumerDataService.findAll(queryDto);
  }

  /**
   * Get consumer data statistics
   */
  @Get('statistics')
  @ApiOperation({
    summary: 'Get consumer data statistics',
    description: 'Get comprehensive statistics and analytics for consumer data',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: ConsumerDataStatsResponseDto,
  })
  async getStatistics(): Promise<ConsumerDataStatsResponseDto> {
    return this.consumerDataService.getStatistics();
  }

  /**
   * Get potential leads
   */
  @Get('potential-leads')
  @ApiOperation({
    summary: 'Get potential leads',
    description:
      'Get consumers with high qualification scores as potential leads',
  })
  @ApiResponse({
    status: 200,
    description: 'Potential leads retrieved successfully',
    type: [ConsumerDataResponseDto],
  })
  @ApiQuery({
    name: 'minScore',
    required: false,
    type: Number,
    description: 'Minimum qualification score (default: 70)',
  })
  async getPotentialLeads(
    @Query('minScore') minScore?: number,
  ): Promise<ConsumerDataResponseDto[]> {
    return this.consumerDataService.findPotentialLeads(minScore);
  }

  /**
   * Get consumer data by consumer number
   */
  @Get('by-consumer-number/:consumerNumber')
  @ApiOperation({
    summary: 'Get consumer by consumer number',
    description:
      'Retrieve consumer data using the electricity board consumer number',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer data found',
    type: ConsumerDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consumer not found',
  })
  @ApiParam({
    name: 'consumerNumber',
    description: 'Electricity board consumer number',
    example: 'N2183020005',
  })
  async findByConsumerNumber(
    @Param('consumerNumber') consumerNumber: string,
  ): Promise<ConsumerDataResponseDto> {
    return this.consumerDataService.findByConsumerNumber(consumerNumber);
  }

  /**
   * Get consumer data by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get consumer data by ID',
    description: 'Retrieve a specific consumer data record by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer data found',
    type: ConsumerDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consumer data not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Consumer data MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  async findOne(@Param('id') id: string): Promise<ConsumerDataResponseDto> {
    return this.consumerDataService.findOne(id);
  }

  /**
   * Update consumer data
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update consumer data',
    description: 'Update an existing consumer data record',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer data updated successfully',
    type: ConsumerDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consumer data not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiParam({
    name: 'id',
    description: 'Consumer data MongoDB ObjectId',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() updateConsumerDataDto: UpdateConsumerDataDto,
  ): Promise<ConsumerDataResponseDto> {
    return this.consumerDataService.update(id, updateConsumerDataDto);
  }

  /**
   * Mark consumer as converted to lead
   */
  @Patch(':id/convert')
  @ApiOperation({
    summary: 'Mark consumer as converted',
    description: 'Mark a consumer as converted to a lead',
  })
  @ApiResponse({
    status: 200,
    description: 'Consumer marked as converted successfully',
    type: ConsumerDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consumer data not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Consumer data MongoDB ObjectId',
  })
  @ApiBody({
    description: 'Optional lead ID reference',
    required: false,
    schema: {
      type: 'object',
      properties: {
        leadId: {
          type: 'string',
          description: 'ID of the created lead',
          example: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  async markAsConverted(
    @Param('id') id: string,
    @Body() body?: { leadId?: string },
  ): Promise<ConsumerDataResponseDto> {
    return this.consumerDataService.markAsConverted(id, body?.leadId);
  }

  /**
   * Delete consumer data (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete consumer data',
    description: 'Soft delete a consumer data record by marking it as invalid',
  })
  @ApiResponse({
    status: 204,
    description: 'Consumer data deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Consumer data not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Consumer data MongoDB ObjectId',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.consumerDataService.remove(id);
  }

  /**
   * Advanced search endpoint with multiple filters
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Advanced search consumer data',
    description: 'Perform advanced search with complex filtering criteria',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: PaginatedConsumerDataResponseDto,
  })
  @ApiBody({
    description: 'Advanced search criteria',
    type: QueryConsumerDataDto,
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async advancedSearch(
    @Body() searchCriteria: QueryConsumerDataDto,
  ): Promise<PaginatedConsumerDataResponseDto> {
    return this.consumerDataService.findAll(searchCriteria);
  }

  /**
   * Export consumer data (future implementation for CSV/Excel export)
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export consumer data',
    description: 'Export filtered consumer data to various formats',
  })
  @ApiResponse({
    status: 200,
    description: 'Export initiated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Export initiated. You will receive an email when ready.',
        },
        exportId: {
          type: 'string',
          example: 'export_123456789',
        },
      },
    },
  })
  @ApiBody({
    description: 'Export criteria and format',
    schema: {
      type: 'object',
      properties: {
        filters: {
          $ref: '#/components/schemas/QueryConsumerDataDto',
        },
        format: {
          type: 'string',
          enum: ['csv', 'excel', 'json'],
          default: 'excel',
        },
        includeFields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific fields to include in export',
        },
      },
    },
  })
  exportData(): { message: string; exportId: string } {
    // TODO: Implement export functionality
    const exportId = `export_${Date.now()}`;
    return {
      message: 'Export feature will be implemented in future updates',
      exportId,
    };
  }
}
