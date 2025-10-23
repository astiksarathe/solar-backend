import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types, SortOrder } from 'mongoose';
import {
  ConsumerDatum,
  ConsumerDatumDocument,
} from './entities/consumer-datum.entity';
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
    @InjectModel(ConsumerDatum.name)
    private readonly consumerDataModel: Model<ConsumerDatumDocument>,
  ) {}

  /**
   * Create a new consumer data record
   */
  async create(createConsumerDataDto: CreateConsumerDataDto): Promise<ConsumerDataResponseDto> {
    try {
      // Check for duplicate consumer number
      const existingConsumer = await this.consumerDataModel.findOne({
        consumerNumber: createConsumerDataDto.consumerNumber,
      });

      if (existingConsumer) {
        throw new BadRequestException(
          `Consumer with number ${createConsumerDataDto.consumerNumber} already exists`,
        );
      }

      const consumerData = new this.consumerDataModel(createConsumerDataDto);
      const savedConsumer = await consumerData.save();

      this.logger.log(`Created consumer data: ${savedConsumer.consumerNumber}`);
      return this.transformToResponseDto(savedConsumer);
    } catch (error) {
      this.logger.error(`Failed to create consumer data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create multiple consumer data records in bulk
   */
  async createBulk(createConsumerDataDtos: CreateConsumerDataDto[]): Promise<BulkOperationResponseDto> {
    const startTime = Date.now();
    const batchId = `bulk_${Date.now()}`;
    let successCount = 0;
    let errorCount = 0;
    const successIds: string[] = [];
    const errors: any[] = [];

    this.logger.log(`Starting bulk creation of ${createConsumerDataDtos.length} records`);

    for (let i = 0; i < createConsumerDataDtos.length; i++) {
      try {
        const dto = createConsumerDataDtos[i];
        
        // Check for duplicates
        const existing = await this.consumerDataModel.findOne({
          consumerNumber: dto.consumerNumber,
        });

        if (existing) {
          errors.push({
            index: i,
            record: dto,
            error: `Duplicate consumer number: ${dto.consumerNumber}`,
          });
          errorCount++;
          continue;
        }

        // Add batch metadata
        if (!dto.scrapingMetadata) {
          dto.scrapingMetadata = {};
        }
        dto.scrapingMetadata.batchId = batchId;

        const consumerData = new this.consumerDataModel(dto);
        const saved = await consumerData.save();
        
        successIds.push((saved._id as Types.ObjectId).toString());
        successCount++;
      } catch (error) {
        errors.push({
          index: i,
          record: createConsumerDataDtos[i],
          error: error.message,
          details: error,
        });
        errorCount++;
      }
    }

    const processingTime = Date.now() - startTime;
    const totalCount = createConsumerDataDtos.length;

    this.logger.log(
      `Bulk creation completed: ${successCount}/${totalCount} successful, ${errorCount} errors`,
    );

    return {
      successCount,
      errorCount,
      totalCount,
      successIds,
      errors,
      status: errorCount === 0 ? 'completed' : successCount === 0 ? 'failed' : 'partial',
      metadata: {
        processingTime,
        batchId,
        duplicatesSkipped: errors.filter(e => e.error.includes('Duplicate')).length,
        validationErrors: errors.filter(e => !e.error.includes('Duplicate')).length,
      },
    };
  }

  /**
   * Find all consumer data with advanced filtering and pagination
   */
  async findAll(queryDto: QueryConsumerDataDto): Promise<PaginatedConsumerDataResponseDto> {
    try {
      const filter = this.buildFilterQuery(queryDto);
      const sortOptions = this.buildSortOptions(queryDto);
      
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 20;
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [data, total] = await Promise.all([
        this.consumerDataModel
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.consumerDataModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Generate summary statistics
      const summary = await this.generateSummaryStats(filter);

      return {
        data: data.map(item => this.transformToResponseDto(item)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
        summary,
      };
    } catch (error) {
      this.logger.error(`Failed to find consumer data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find consumer data by ID
   */
  async findOne(id: string): Promise<ConsumerDataResponseDto> {
    try {
      const consumerData = await this.consumerDataModel.findById(id).lean();
      
      if (!consumerData) {
        throw new NotFoundException(`Consumer data with ID ${id} not found`);
      }

      return this.transformToResponseDto(consumerData);
    } catch (error) {
      this.logger.error(`Failed to find consumer data by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find consumer data by consumer number
   */
  async findByConsumerNumber(consumerNumber: string): Promise<ConsumerDataResponseDto> {
    try {
      const consumerData = await this.consumerDataModel
        .findOne({ consumerNumber: consumerNumber.toUpperCase() })
        .lean();
      
      if (!consumerData) {
        throw new NotFoundException(`Consumer with number ${consumerNumber} not found`);
      }

      return this.transformToResponseDto(consumerData);
    } catch (error) {
      this.logger.error(`Failed to find consumer by number ${consumerNumber}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update consumer data by ID
   */
  async update(id: string, updateConsumerDataDto: UpdateConsumerDataDto): Promise<ConsumerDataResponseDto> {
    try {
      // Handle additional notes
      if (updateConsumerDataDto.additionalNotes) {
        const existingConsumer = await this.consumerDataModel.findById(id);
        if (existingConsumer) {
          updateConsumerDataDto.notes = [
            ...(existingConsumer.notes || []),
            ...updateConsumerDataDto.additionalNotes,
          ];
        }
        delete updateConsumerDataDto.additionalNotes;
      }

      const updatedConsumer = await this.consumerDataModel
        .findByIdAndUpdate(id, updateConsumerDataDto, { new: true, runValidators: true })
        .lean();

      if (!updatedConsumer) {
        throw new NotFoundException(`Consumer data with ID ${id} not found`);
      }

      this.logger.log(`Updated consumer data: ${id}`);
      return this.transformToResponseDto(updatedConsumer);
    } catch (error) {
      this.logger.error(`Failed to update consumer data ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete consumer data by ID (soft delete)
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.consumerDataModel.findByIdAndUpdate(
        id,
        { status: 'invalid' },
        { new: true }
      );

      if (!result) {
        throw new NotFoundException(`Consumer data with ID ${id} not found`);
      }

      this.logger.log(`Soft deleted consumer data: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete consumer data ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getStatistics(): Promise<ConsumerDataStatsResponseDto> {
    try {
      const [
        totalRecords,
        statusStats,
        propertyTypeStats,
        sourceStats,
        divisionStats,
        averages,
        ranges,
        dataQuality,
        businessMetrics,
      ] = await Promise.all([
        this.consumerDataModel.countDocuments({ status: { $ne: 'invalid' } }),
        this.getStatusBreakdown(),
        this.getPropertyTypeBreakdown(),
        this.getSourceBreakdown(),
        this.getDivisionBreakdown(),
        this.getAverages(),
        this.getRanges(),
        this.getDataQualityMetrics(),
        this.getBusinessMetrics(),
      ]);

      return {
        totalRecords,
        statusStats,
        propertyTypeStats,
        sourceStats,
        divisionStats,
        averages,
        ranges,
        dataQuality,
        businessMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for potential leads based on qualification criteria
   */
  async findPotentialLeads(minScore = 70): Promise<ConsumerDataResponseDto[]> {
    try {
      const potentialLeads = await this.consumerDataModel
        .find({
          status: { $in: ['new', 'contacted'] },
          isConverted: false,
          qualificationScore: { $gte: minScore },
        })
        .sort({ qualificationScore: -1, avgUnits: -1 })
        .limit(100)
        .lean();

      return potentialLeads.map(lead => this.transformToResponseDto(lead));
    } catch (error) {
      this.logger.error(`Failed to find potential leads: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark consumer as converted to lead
   */
  async markAsConverted(id: string, leadId?: string): Promise<ConsumerDataResponseDto> {
    try {
      const updateData: any = {
        isConverted: true,
        status: 'converted',
      };

      if (leadId) {
        updateData.convertedToLeadId = leadId;
      }

      const updatedConsumer = await this.consumerDataModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .lean();

      if (!updatedConsumer) {
        throw new NotFoundException(`Consumer data with ID ${id} not found`);
      }

      this.logger.log(`Marked consumer as converted: ${id}`);
      return this.transformToResponseDto(updatedConsumer);
    } catch (error) {
      this.logger.error(`Failed to mark consumer as converted ${id}: ${error.message}`);
      throw error;
    }
  }

  // PRIVATE HELPER METHODS

  private buildFilterQuery(queryDto: QueryConsumerDataDto): FilterQuery<ConsumerDatumDocument> {
    const filter: FilterQuery<ConsumerDatumDocument> = { status: { $ne: 'invalid' } };

    // Text search
    if (queryDto.search) {
      filter.$or = [
        { name: { $regex: queryDto.search, $options: 'i' } },
        { consumerNumber: { $regex: queryDto.search, $options: 'i' } },
        { mobileNumber: { $regex: queryDto.search, $options: 'i' } },
        { address: { $regex: queryDto.search, $options: 'i' } },
      ];
    }

    // Exact matches
    if (queryDto.consumerNumber) filter.consumerNumber = queryDto.consumerNumber;
    if (queryDto.mobileNumber) filter.mobileNumber = queryDto.mobileNumber;
    if (queryDto.divisionName) filter.divisionName = queryDto.divisionName;
    if (queryDto.status) filter.status = queryDto.status;
    if (queryDto.propertyType) filter.propertyType = queryDto.propertyType;
    if (queryDto.source) filter.source = queryDto.source;
    if (queryDto.preferredLanguage) filter.preferredLanguage = queryDto.preferredLanguage;
    if (queryDto.bestContactTime) filter.bestContactTime = queryDto.bestContactTime;

    // Boolean filters
    if (queryDto.isConverted !== undefined) filter.isConverted = queryDto.isConverted;
    if (queryDto.isHighConsumer !== undefined) filter.isHighConsumer = queryDto.isHighConsumer;

    // Numeric ranges
    if (queryDto.minAvgUnits !== undefined || queryDto.maxAvgUnits !== undefined) {
      filter.avgUnits = {};
      if (queryDto.minAvgUnits !== undefined) filter.avgUnits.$gte = queryDto.minAvgUnits;
      if (queryDto.maxAvgUnits !== undefined) filter.avgUnits.$lte = queryDto.maxAvgUnits;
    }

    if (queryDto.minAvgBill !== undefined || queryDto.maxAvgBill !== undefined) {
      filter.avgMonthlyBill = {};
      if (queryDto.minAvgBill !== undefined) filter.avgMonthlyBill.$gte = queryDto.minAvgBill;
      if (queryDto.maxAvgBill !== undefined) filter.avgMonthlyBill.$lte = queryDto.maxAvgBill;
    }

    if (queryDto.minQualificationScore !== undefined || queryDto.maxQualificationScore !== undefined) {
      filter.qualificationScore = {};
      if (queryDto.minQualificationScore !== undefined) filter.qualificationScore.$gte = queryDto.minQualificationScore;
      if (queryDto.maxQualificationScore !== undefined) filter.qualificationScore.$lte = queryDto.maxQualificationScore;
    }

    // Date ranges
    if (queryDto.createdAfter || queryDto.createdBefore) {
      filter.createdAt = {};
      if (queryDto.createdAfter) filter.createdAt.$gte = new Date(queryDto.createdAfter);
      if (queryDto.createdBefore) filter.createdAt.$lte = new Date(queryDto.createdBefore);
    }

    // Geographic filters
    if (queryDto.state) filter['parsedAddress.state'] = { $regex: queryDto.state, $options: 'i' };
    if (queryDto.district) filter['parsedAddress.district'] = { $regex: queryDto.district, $options: 'i' };
    if (queryDto.pincode) filter['parsedAddress.pincode'] = queryDto.pincode;

    // Advanced filters
    if (queryDto.hasEmail) filter.email = { $exists: true, $ne: null };
    if (queryDto.hasCoordinates) filter['parsedAddress.coordinates'] = { $exists: true };
    if (queryDto.dataQuality) filter['scrapingMetadata.dataQuality'] = queryDto.dataQuality;
    if (queryDto.potentialLeadsOnly) filter.qualificationScore = { $gte: 70 };

    return filter;
  }

  private buildSortOptions(queryDto: QueryConsumerDataDto): Record<string, SortOrder> {
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  }

  private async generateSummaryStats(filter: FilterQuery<ConsumerDatumDocument>) {
    const aggregation = await this.consumerDataModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          highConsumers: { $sum: { $cond: ['$isHighConsumer', 1, 0] } },
          potentialLeads: { $sum: { $cond: [{ $gte: ['$qualificationScore', 70] }, 1, 0] } },
          avgQualificationScore: { $avg: '$qualificationScore' },
          avgMonthlyBill: { $avg: '$avgMonthlyBill' },
          avgUnits: { $avg: '$avgUnits' },
        },
      },
    ]);

    const [statusBreakdown, propertyTypeBreakdown] = await Promise.all([
      this.getStatusBreakdown(filter),
      this.getPropertyTypeBreakdown(filter),
    ]);

    const stats = aggregation[0] || {};
    return {
      totalRecords: stats.totalRecords || 0,
      highConsumers: stats.highConsumers || 0,
      potentialLeads: stats.potentialLeads || 0,
      avgQualificationScore: Math.round(stats.avgQualificationScore || 0),
      avgMonthlyBill: Math.round(stats.avgMonthlyBill || 0),
      avgUnits: Math.round(stats.avgUnits || 0),
      statusBreakdown,
      propertyTypeBreakdown,
    };
  }

  private async getStatusBreakdown(filter?: FilterQuery<ConsumerDatumDocument>) {
    const pipeline: any[] = [];
    if (filter) pipeline.push({ $match: filter });
    pipeline.push(
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          breakdown: {
            $push: {
              k: '$_id',
              v: '$count',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: '$breakdown' },
        },
      },
    );

    const result = await this.consumerDataModel.aggregate(pipeline);
    return result[0] || {};
  }

  private async getPropertyTypeBreakdown(filter?: FilterQuery<ConsumerDatumDocument>) {
    const pipeline: any[] = [];
    if (filter) pipeline.push({ $match: filter });
    pipeline.push(
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          breakdown: {
            $push: {
              k: { $ifNull: ['$_id', 'unknown'] },
              v: '$count',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: '$breakdown' },
        },
      },
    );

    const result = await this.consumerDataModel.aggregate(pipeline);
    return result[0] || {};
  }

  private async getSourceBreakdown() {
    const result = await this.consumerDataModel.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          breakdown: {
            $push: {
              k: '$_id',
              v: '$count',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: '$breakdown' },
        },
      },
    ]);

    return result[0] || {};
  }

  private async getDivisionBreakdown() {
    const result = await this.consumerDataModel.aggregate([
      {
        $group: {
          _id: '$divisionName',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20, // Top 20 divisions
      },
      {
        $group: {
          _id: null,
          breakdown: {
            $push: {
              k: '$_id',
              v: '$count',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: '$breakdown' },
        },
      },
    ]);

    return result[0] || {};
  }

  private async getAverages() {
    const result = await this.consumerDataModel.aggregate([
      {
        $match: { status: { $ne: 'invalid' } },
      },
      {
        $group: {
          _id: null,
          avgUnits: { $avg: '$avgUnits' },
          avgMonthlyBill: { $avg: '$avgMonthlyBill' },
          qualificationScore: { $avg: '$qualificationScore' },
          estimatedSolarCapacity: { $avg: '$estimatedSolarCapacity' },
          estimatedMonthlySavings: { $avg: '$estimatedMonthlySavings' },
        },
      },
    ]);

    const stats = result[0] || {};
    return {
      avgUnits: Math.round(stats.avgUnits || 0),
      avgMonthlyBill: Math.round(stats.avgMonthlyBill || 0),
      qualificationScore: Math.round(stats.qualificationScore || 0),
      estimatedSolarCapacity: Math.round((stats.estimatedSolarCapacity || 0) * 10) / 10,
      estimatedMonthlySavings: Math.round(stats.estimatedMonthlySavings || 0),
    };
  }

  private async getRanges() {
    const result = await this.consumerDataModel.aggregate([
      {
        $match: { status: { $ne: 'invalid' } },
      },
      {
        $group: {
          _id: null,
          minUnits: { $min: '$avgUnits' },
          maxUnits: { $max: '$avgUnits' },
          minBill: { $min: '$avgMonthlyBill' },
          maxBill: { $max: '$avgMonthlyBill' },
          minQualification: { $min: '$qualificationScore' },
          maxQualification: { $max: '$qualificationScore' },
        },
      },
    ]);

    const stats = result[0] || {};
    return {
      unitsRange: {
        min: stats.minUnits || 0,
        max: stats.maxUnits || 0,
      },
      billRange: {
        min: stats.minBill || 0,
        max: stats.maxBill || 0,
      },
      qualificationRange: {
        min: stats.minQualification || 0,
        max: stats.maxQualification || 0,
      },
    };
  }

  private async getDataQualityMetrics() {
    const result = await this.consumerDataModel.aggregate([
      {
        $match: { status: { $ne: 'invalid' } },
      },
      {
        $group: {
          _id: null,
          withEmail: { $sum: { $cond: [{ $ne: ['$email', null] }, 1, 0] } },
          withCoordinates: { $sum: { $cond: ['$parsedAddress.coordinates', 1, 0] } },
          highQualityData: { $sum: { $cond: [{ $eq: ['$scrapingMetadata.dataQuality', 'complete'] }, 1, 0] } },
          emailLookupAttempted: { $sum: { $cond: ['$enrichmentAttempts.emailLookup', 1, 0] } },
          geocodingAttempted: { $sum: { $cond: ['$enrichmentAttempts.addressGeocoding', 1, 0] } },
          propertyDetailsAttempted: { $sum: { $cond: ['$enrichmentAttempts.propertyDetails', 1, 0] } },
        },
      },
    ]);

    const stats = result[0] || {};
    return {
      withEmail: stats.withEmail || 0,
      withCoordinates: stats.withCoordinates || 0,
      highQualityData: stats.highQualityData || 0,
      enrichmentCoverage: {
        emailLookup: stats.emailLookupAttempted || 0,
        geocoding: stats.geocodingAttempted || 0,
        propertyDetails: stats.propertyDetailsAttempted || 0,
      },
    };
  }

  private async getBusinessMetrics() {
    const [businessStats, conversionData] = await Promise.all([
      this.consumerDataModel.aggregate([
        {
          $match: { status: { $ne: 'invalid' } },
        },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            highConsumers: { $sum: { $cond: ['$isHighConsumer', 1, 0] } },
            potentialLeads: { $sum: { $cond: [{ $gte: ['$qualificationScore', 70] }, 1, 0] } },
            estimatedTotalSavingsPotential: { $sum: '$estimatedMonthlySavings' },
            averageSystemSize: { $avg: '$estimatedSolarCapacity' },
            converted: { $sum: { $cond: ['$isConverted', 1, 0] } },
          },
        },
      ]),
      this.consumerDataModel.countDocuments({ status: { $ne: 'invalid' } }),
    ]);

    const stats = businessStats[0] || {};
    const conversionRate = conversionData > 0 ? (stats.converted || 0) / conversionData : 0;

    return {
      highConsumers: stats.highConsumers || 0,
      potentialLeads: stats.potentialLeads || 0,
      estimatedTotalSavingsPotential: Math.round((stats.estimatedTotalSavingsPotential || 0) * 12), // Annual
      averageSystemSize: Math.round((stats.averageSystemSize || 0) * 10) / 10,
      conversionRate: Math.round(conversionRate * 10000) / 100, // Percentage with 2 decimals
    };
  }

  private transformToResponseDto(consumerData: any): ConsumerDataResponseDto {
    return {
      _id: consumerData._id?.toString() || consumerData._id,
      name: consumerData.name,
      consumerNumber: consumerData.consumerNumber,
      address: consumerData.address,
      divisionName: consumerData.divisionName,
      mobileNumber: consumerData.mobileNumber,
      purpose: consumerData.purpose,
      amount: consumerData.amount,
      last6MonthsUnits: consumerData.last6MonthsUnits,
      avgUnits: consumerData.avgUnits,
      avgMonthlyBill: consumerData.avgMonthlyBill,
      isHighConsumer: consumerData.isHighConsumer,
      qualificationScore: consumerData.qualificationScore,
      estimatedSolarCapacity: consumerData.estimatedSolarCapacity,
      estimatedMonthlySavings: consumerData.estimatedMonthlySavings,
      estimatedPaybackMonths: consumerData.estimatedPaybackMonths,
      email: consumerData.email,
      propertyType: consumerData.propertyType,
      electricityProvider: consumerData.electricityProvider,
      connectionType: consumerData.connectionType,
      status: consumerData.status,
      source: consumerData.source,
      isConverted: consumerData.isConverted,
      parsedAddress: consumerData.parsedAddress,
      preferredLanguage: consumerData.preferredLanguage,
      bestContactTime: consumerData.bestContactTime,
      scrapingMetadata: consumerData.scrapingMetadata,
      enrichmentAttempts: consumerData.enrichmentAttempts,
      notes: consumerData.notes || [],
      createdAt: consumerData.createdAt,
      updatedAt: consumerData.updatedAt,
    };
  }
}
