import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private leadModel: Model<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = new this.leadModel({
      ...createLeadDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return lead.save();
  }

  async findAll(query: any = {}): Promise<{
    data: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      status,
      priority,
      assignedTo,
      customerType,
      interestLevel,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (customerType) filter.customerType = customerType;
    if (interestLevel) filter.interestLevel = interestLevel;

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { consumerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('consumerId', 'name phone email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('orderId', 'orderNumber status')
        .exec(),
      this.leadModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadModel
      .findById(id)
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('orderId', 'orderNumber status')
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async findByConsumerId(consumerId: string): Promise<Lead[]> {
    return this.leadModel
      .find({ consumerId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const updatedLead = await this.leadModel
      .findByIdAndUpdate(
        id,
        { ...updateLeadDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('orderId', 'orderNumber status')
      .exec();

    if (!updatedLead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return updatedLead;
  }

  async remove(id: string): Promise<void> {
    const result = await this.leadModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }

  async convertToOrder(leadId: string, orderId: string): Promise<Lead> {
    const lead = await this.leadModel
      .findByIdAndUpdate(
        leadId,
        {
          status: 'closed_won',
          orderId,
          convertedToOrderDate: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    return lead;
  }

  async getLeadStats(
    assignedTo?: string,
    dateRange?: { fromDate: Date; toDate: Date },
  ) {
    const filter: Record<string, any> = {};
    if (assignedTo) filter.assignedTo = assignedTo;
    if (dateRange) {
      filter.createdAt = {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      };
    }

    const [statusStats, priorityStats, customerTypeStats] = await Promise.all([
      this.leadModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$estimatedBudget' },
          },
        },
      ]),
      this.leadModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),
      this.leadModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$customerType',
            count: { $sum: 1 },
            avgBudget: { $avg: '$estimatedBudget' },
          },
        },
      ]),
    ]);

    return {
      statusStats,
      priorityStats,
      customerTypeStats,
    };
  }

  async getUpcomingFollowUps(assignedTo?: string): Promise<Lead[]> {
    const filter: Record<string, any> = {
      nextFollowUpDate: { $lte: new Date() },
      status: { $nin: ['closed_won', 'closed_lost'] },
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.leadModel
      .find(filter)
      .sort({ nextFollowUpDate: 1 })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .limit(20)
      .exec();
  }
}
