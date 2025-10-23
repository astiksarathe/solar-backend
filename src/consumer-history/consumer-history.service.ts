import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConsumerHistory } from './entities/consumer-history.entity';
import { CreateConsumerHistoryDto } from './dto/create-consumer-history.dto';
import { UpdateConsumerHistoryDto } from './dto/update-consumer-history.dto';
import { QueryConsumerHistoryDto } from './dto/query-consumer-history.dto';

@Injectable()
export class ConsumerHistoryService {
  constructor(
    @InjectModel(ConsumerHistory.name)
    private consumerHistoryModel: Model<ConsumerHistory>,
  ) {}

  async create(
    createConsumerHistoryDto: CreateConsumerHistoryDto,
  ): Promise<ConsumerHistory> {
    const consumerHistory = new this.consumerHistoryModel({
      ...createConsumerHistoryDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return consumerHistory.save();
  }

  async findAll(query: QueryConsumerHistoryDto): Promise<{
    data: ConsumerHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      consumerId,
      consumerNumber,
      interactionType,
      status,
      assignedTo,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, any> = {};

    if (consumerId) filter.consumerId = consumerId;
    if (consumerNumber)
      filter.consumerNumber = { $regex: consumerNumber, $options: 'i' };
    if (interactionType) filter.interactionType = interactionType;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    if (fromDate || toDate) {
      filter.scheduledDate = {};
      if (fromDate) filter.scheduledDate.$gte = new Date(fromDate);
      if (toDate) filter.scheduledDate.$lte = new Date(toDate);
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.consumerHistoryModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('consumerId', 'name phone email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .exec(),
      this.consumerHistoryModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ConsumerHistory> {
    const consumerHistory = await this.consumerHistoryModel
      .findById(id)
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!consumerHistory) {
      throw new NotFoundException(`Consumer history with ID ${id} not found`);
    }

    return consumerHistory;
  }

  async findByConsumerId(consumerId: string): Promise<ConsumerHistory[]> {
    return this.consumerHistoryModel
      .find({ consumerId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }

  async update(
    id: string,
    updateConsumerHistoryDto: UpdateConsumerHistoryDto,
  ): Promise<ConsumerHistory> {
    const updatedConsumerHistory = await this.consumerHistoryModel
      .findByIdAndUpdate(
        id,
        { ...updateConsumerHistoryDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!updatedConsumerHistory) {
      throw new NotFoundException(`Consumer history with ID ${id} not found`);
    }

    return updatedConsumerHistory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.consumerHistoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Consumer history with ID ${id} not found`);
    }
  }

  async getInteractionStats(
    consumerId?: string,
    dateRange?: { fromDate: Date; toDate: Date },
  ) {
    const filter: Record<string, any> = {};
    if (consumerId) filter.consumerId = consumerId;
    if (dateRange) {
      filter.scheduledDate = {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      };
    }

    const stats = await this.consumerHistoryModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
    ]);

    return stats;
  }
}
