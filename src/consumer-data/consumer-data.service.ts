import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConsumerData,
  ConsumerDataDocument,
} from '../schemas/consumer-data.schema';
import { CreateConsumerDataDto } from './dto/create-consumer-data.dto';
import { UpdateConsumerDataDto } from './dto/update-consumer-data.dto';
import { QueryConsumerDataDto } from './dto/query-consumer-data.dto';
import {
  ConsumerDataResponseDto,
  PaginatedConsumerDataResponseDto,
  BulkOperationResponseDto,
  ConsumerDataStatsResponseDto,
} from './dto/consumer-data-response.dto';

@Injectable()
export class ConsumerDataService {
  private readonly logger = new Logger(ConsumerDataService.name);

  constructor(
    @InjectModel(ConsumerData.name)
    private consumerModel: Model<ConsumerDataDocument>,
  ) {}

  /**
   * Create a new consumer data record
   */
  async create(
    createConsumerDataDto: CreateConsumerDataDto,
  ): Promise<ConsumerDataResponseDto> {
    try {
      const consumerData = new this.consumerModel(createConsumerDataDto);
      const saved = await consumerData.save();
      return this.transformToResponse(saved);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'Consumer with this number already exists',
        );
      }
      this.logger.error(`Failed to create consumer data: ${error.message}`);
      throw new BadRequestException('Failed to create consumer data');
    }
  }

  /**
   * Get all consumer data with filtering and pagination
   */
  async findAll(
    queryDto: QueryConsumerDataDto,
  ): Promise<PaginatedConsumerDataResponseDto> {
    try {
      const {
        search,
        status,
        propertyType,
        isHighConsumer,
        potentialLeadsOnly,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      // Build filter
      const filter: any = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { consumerNumber: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) {
        filter.status = status;
      }

      if (propertyType) {
        filter.propertyType = propertyType;
      }

      if (isHighConsumer !== undefined) {
        filter.isHighConsumer = isHighConsumer;
      }

      if (potentialLeadsOnly) {
        filter.qualificationScore = { $gte: 70 };
      }

      // Count total documents
      const total = await this.consumerModel.countDocuments(filter);

      // Calculate pagination
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const data = await this.consumerModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        data: data.map((item) => this.transformToResponse(item)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch consumer data: ${error.message}`);
      throw new BadRequestException('Failed to fetch consumer data');
    }
  }

  /**
   * Get consumer data by ID
   */
  async findOne(id: string): Promise<ConsumerDataResponseDto> {
    try {
      const consumerData = await this.consumerModel.findById(id).exec();
      if (!consumerData) {
        throw new NotFoundException('Consumer data not found');
      }
      return this.transformToResponse(consumerData);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find consumer data: ${error.message}`);
      throw new BadRequestException('Failed to find consumer data');
    }
  }

  /**
   * Get consumer data by consumer number
   */
  async findByConsumerNumber(
    consumerNumber: string,
  ): Promise<ConsumerDataResponseDto> {
    try {
      const consumerData = await this.consumerModel
        .findOne({ consumerNumber: consumerNumber.toUpperCase() })
        .exec();
      if (!consumerData) {
        throw new NotFoundException('Consumer not found');
      }
      return this.transformToResponse(consumerData);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find consumer by number: ${error.message}`,
      );
      throw new BadRequestException('Failed to find consumer');
    }
  }

  /**
   * Update consumer data
   */
  async update(
    id: string,
    updateConsumerDataDto: UpdateConsumerDataDto,
  ): Promise<ConsumerDataResponseDto> {
    try {
      const updated = await this.consumerModel
        .findByIdAndUpdate(id, updateConsumerDataDto, { new: true })
        .exec();
      if (!updated) {
        throw new NotFoundException('Consumer data not found');
      }
      return this.transformToResponse(updated);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update consumer data: ${error.message}`);
      throw new BadRequestException('Failed to update consumer data');
    }
  }

  /**
   * Mark consumer as converted
   */
  async markAsConverted(
    id: string,
    leadId?: string,
  ): Promise<ConsumerDataResponseDto> {
    try {
      const updateData: any = {
        status: 'converted',
        convertedAt: new Date(),
      };

      if (leadId) {
        updateData.leadId = leadId;
      }

      const updated = await this.consumerModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!updated) {
        throw new NotFoundException('Consumer data not found');
      }

      return this.transformToResponse(updated);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to mark as converted: ${error.message}`);
      throw new BadRequestException('Failed to mark as converted');
    }
  }

  /**
   * Soft delete consumer data
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.consumerModel
        .findByIdAndUpdate(id, { status: 'invalid' }, { new: true })
        .exec();
      if (!result) {
        throw new NotFoundException('Consumer data not found');
      }
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete consumer data: ${error.message}`);
      throw new BadRequestException('Failed to delete consumer data');
    }
  }

  /**
   * Create multiple consumer data records
   */
  async createBulk(
    createConsumerDataDtos: CreateConsumerDataDto[],
  ): Promise<BulkOperationResponseDto> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      successIds: [] as string[],
    };

    for (let i = 0; i < createConsumerDataDtos.length; i++) {
      try {
        const created = await this.create(createConsumerDataDtos[i]);
        results.success++;
        results.successIds.push(created._id);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          error: error.message,
          record: createConsumerDataDtos[i],
        });
      }
    }

    return {
      totalCount: createConsumerDataDtos.length,
      successCount: results.success,
      errorCount: results.failed,
      successIds: results.successIds,
      errors: results.errors,
      status: results.failed === 0 ? 'completed' : 'partial',
    };
  }

  /**
   * Get basic statistics
   */
  async getStatistics(): Promise<ConsumerDataStatsResponseDto> {
    try {
      const total = await this.consumerModel.countDocuments();
      const highConsumerCount = await this.consumerModel.countDocuments({
        isHighConsumer: true,
      });
      const convertedCount = await this.consumerModel.countDocuments({
        status: 'converted',
      });

      // Get status distribution
      const statusAgg = await this.consumerModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Get property type distribution
      const propertyAgg = await this.consumerModel.aggregate([
        {
          $group: {
            _id: '$propertyType',
            count: { $sum: 1 },
          },
        },
      ]);

      // Get averages
      const avgAgg = await this.consumerModel.aggregate([
        {
          $group: {
            _id: null,
            avgBill: { $avg: '$avgMonthlyBill' },
            avgUnits: { $avg: '$avgUnits' },
          },
        },
      ]);

      const averages = avgAgg[0] || { avgBill: 0, avgUnits: 0 };

      return {
        totalRecords: total,
        statusStats: statusAgg.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        propertyTypeStats: propertyAgg.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        sourceStats: {},
        divisionStats: {},
        averages: {
          avgUnits: Math.round(averages.avgUnits || 0),
          avgMonthlyBill: Math.round(averages.avgBill || 0),
          qualificationScore: 0,
          estimatedSolarCapacity: 0,
          estimatedMonthlySavings: 0,
        },
        ranges: {
          unitsRange: { min: 0, max: 0 },
          billRange: { min: 0, max: 0 },
          qualificationRange: { min: 0, max: 100 },
        },
        dataQuality: {
          withEmail: 0,
          withCoordinates: 0,
          highQualityData: 0,
          enrichmentCoverage: {
            emailLookup: 0,
            geocoding: 0,
            propertyDetails: 0,
          },
        },
        businessMetrics: {
          highConsumers: highConsumerCount,
          potentialLeads: 0,
          estimatedTotalSavingsPotential: 0,
          averageSystemSize: 0,
          conversionRate:
            total > 0
              ? Math.round((convertedCount / total) * 100 * 100) / 100
              : 0,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      throw new BadRequestException('Failed to get statistics');
    }
  }

  /**
   * Find potential leads
   */
  async findPotentialLeads(
    minScore: number = 70,
  ): Promise<ConsumerDataResponseDto[]> {
    try {
      const leads = await this.consumerModel
        .find({
          qualificationScore: { $gte: minScore },
          status: { $ne: 'converted' },
        })
        .sort({ qualificationScore: -1 })
        .limit(50)
        .exec();

      return leads.map((lead) => this.transformToResponse(lead));
    } catch (error: any) {
      this.logger.error(`Failed to find potential leads: ${error.message}`);
      throw new BadRequestException('Failed to find potential leads');
    }
  }

  /**
   * Transform document to response DTO
   */
  private transformToResponse(
    document: ConsumerDataDocument,
  ): ConsumerDataResponseDto {
    return {
      _id: (document._id as any).toString(),
      name: document.name,
      consumerNumber: document.consumerNumber,
      address: document.address,
      divisionName: document.divisionName,
      mobileNumber: document.mobileNumber,
      purpose: document.purpose,
      amount: document.amount,
      last6MonthsUnits: document.last6MonthsUnits,
      avgUnits: document.avgUnits,
      avgMonthlyBill: document.avgMonthlyBill,
      propertyType: document.propertyType,
      status: document.status,
      isHighConsumer: document.isHighConsumer,
      qualificationScore: document.qualificationScore,
      estimatedSolarCapacity: document.estimatedSolarCapacity,
      notes: document.notes,
      source: document.source,
      isConverted: document.isConverted,
      createdAt: document.createdAt || new Date(),
      updatedAt: document.updatedAt || new Date(),
    };
  }
}