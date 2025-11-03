import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SolarProject,
  SolarProjectDocument,
} from '../schemas/solar-project.model';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import {
  PaginatedSolarProjectResponseDto,
  SolarProjectResponseDto,
} from './dto/solar-project-response.dto';
import { QuerySolarProjectDto } from './dto/query-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';

@Injectable()
export class SolarProjectService {
  private readonly logger = new Logger(SolarProjectService.name);

  constructor(
    @InjectModel(SolarProject.name)
    private solarProjectModel: Model<SolarProjectDocument>,
  ) {}

  /**
   * Create a new Solar Project
   */
  async create(
    createSolarProjectDto: CreateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    try {
      // Extract amount and units from billHistory if present
      let amount: number[] = [];
      let units: number[] = [];
      if (Array.isArray((createSolarProjectDto as any).billHistory)) {
        amount = (createSolarProjectDto as any).billHistory.map((bill: any) => Number(bill.amount));
        units = (createSolarProjectDto as any).billHistory.map((bill: any) => Number(bill.consumption));
      }

      // Calculate averages
      const validAmounts = amount.filter(a => typeof a === 'number');
      const avgMonthlyBill = validAmounts.length > 0
        ? validAmounts.reduce((sum, amt) => sum + amt, 0) / validAmounts.length
        : undefined;

      const validUnits = units.filter(u => typeof u === 'number');
      const avgUnits = validUnits.length > 0
        ? validUnits.reduce((sum, unit) => sum + unit, 0) / validUnits.length
        : undefined;

      // Initial timeline entry
      const timeline = [
        {
          date: new Date(),
          type: 'record_add',
          message: 'Record created',
        },
      ];

      // Prepare payload
      const payload = {
        ...createSolarProjectDto,
        amount,
        units,
        avgMonthlyBill,
        avgUnits,
        timeline,
      };
      const project = new this.solarProjectModel(payload);
      const saved = await project.save();
      return this.transformToResponse(saved);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'Project with this consumer number already exists',
        );
      }
      this.logger.error(`Failed to create solar project: ${error.message}`);
      throw new BadRequestException('Failed to create solar project');
    }
  }

  /**
   * Get all solar projects with filtering, sorting & pagination
   */
  async findAll(
    queryDto: QuerySolarProjectDto,
  ): Promise<PaginatedSolarProjectResponseDto> {
    try {
      const {
        search,
        status,
        propertyType,
        assignedTo,
        tags,
        isConverted,
        createdAfter,
        createdBefore,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      const filter: any = {};

      // === SEARCH ===
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { consumerNumber: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ];
      }

      // === STATUS FILTER ===
      if (status) filter.status = status;

      // === PROPERTY TYPE ===
      if (propertyType) filter.propertyType = propertyType;

      // === ASSIGNED TO ===
      if (assignedTo) filter.assignedTo = assignedTo;

      // === TAGS ===
      if (tags) {
        const tagArray = tags.split(',').map((t) => t.trim());
        filter.tags = { $in: tagArray };
      }

      // === CONVERTED STATUS ===
      if (isConverted !== undefined) {
        filter.isConverted = isConverted;
      }

      // === DATE FILTER ===
      if (createdAfter || createdBefore) {
        filter.createdAt = {};
        if (createdAfter) filter.createdAt.$gte = new Date(createdAfter);
        if (createdBefore) filter.createdAt.$lte = new Date(createdBefore);
      }

      // === PAGINATION ===
      const skip = (page - 1) * limit;
      const total = await this.solarProjectModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // === SORT ===
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const data = await this.solarProjectModel
        .find(filter)
        .populate('assignedTo', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

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
      this.logger.error(`Failed to fetch solar projects: ${error.message}`);
      throw new BadRequestException('Failed to fetch solar projects');
    }
  }

  /**
   * Get a single Solar Project by ID
   */
  async findOne(id: string): Promise<SolarProjectResponseDto> {
    try {
      const project = await this.solarProjectModel.findById(id).lean();
      if (!project) {
        throw new NotFoundException('Solar project not found');
      }
      return this.transformToResponse(project);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find solar project: ${error.message}`);
      throw new BadRequestException('Failed to find solar project');
    }
  }

  /**
   * Update a Solar Project
   */
  async update(
    id: string,
    updateDto: UpdateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    try {
      const updated = await this.solarProjectModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .populate('assignedTo', 'username email')
        .lean();
      if (!updated) throw new NotFoundException('Solar project not found');
      return this.transformToResponse(updated);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update solar project: ${error.message}`);
      throw new BadRequestException('Failed to update solar project');
    }
  }

  /**
   * Soft delete (mark invalid) project
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.solarProjectModel
        .findByIdAndUpdate(id, { status: 'invalid' }, { new: true })
        .exec();
      if (!result) throw new NotFoundException('Solar project not found');
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete solar project: ${error.message}`);
      throw new BadRequestException('Failed to delete solar project');
    }
  }

  /**
   * Transform document to response DTO
   */
  private transformToResponse(
    document: Partial<SolarProject> & { _id: any },
  ): SolarProjectResponseDto {
    return {
      _id: document._id?.toString(),
      name: document.name || '',
      consumerNumber: document.consumerNumber || '',
      address: document.address || '',
      divisionName: document.divisionName || '',
      mobileNumber: document.mobileNumber || '',
      purpose: document.purpose || '',
      amount: document.amount,
      avgMonthlyBill: document.avgMonthlyBill,
      propertyType: document.propertyType,
      status: document.status,
      isConverted: document.isConverted,
      tags: document.tags,
      createdAt: document.createdAt || new Date(),
      updatedAt: document.updatedAt || new Date(),
    };
  }
}
