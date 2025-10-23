import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      priority,
      interestLevel,
      outcome,
      tags,
      search,
      fromDate,
      toDate,
      followUpFromDate,
      followUpToDate,
      minBudget,
      maxBudget,
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
    if (priority) filter.priority = priority;
    if (interestLevel) filter.interestLevel = interestLevel;
    if (outcome) filter.outcome = outcome;
    if (tags && tags.length > 0) filter.tags = { $in: tags };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (fromDate || toDate) {
      filter.scheduledDate = {};
      if (fromDate) filter.scheduledDate.$gte = new Date(fromDate);
      if (toDate) filter.scheduledDate.$lte = new Date(toDate);
    }

    if (followUpFromDate || followUpToDate) {
      filter.nextFollowUp = {};
      if (followUpFromDate)
        filter.nextFollowUp.$gte = new Date(followUpFromDate);
      if (followUpToDate) filter.nextFollowUp.$lte = new Date(followUpToDate);
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      filter.estimatedBudget = {};
      if (minBudget !== undefined) filter.estimatedBudget.$gte = minBudget;
      if (maxBudget !== undefined) filter.estimatedBudget.$lte = maxBudget;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.consumerHistoryModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('consumerId', 'name phone email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .exec(),
      this.consumerHistoryModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
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

  // Enhanced business logic methods
  async completeInteraction(
    id: string,
    completionData: {
      outcome?: string;
      notes?: string;
      nextFollowUp?: string;
      interestLevel?: string;
      estimatedBudget?: number;
      updatedBy: string;
    },
  ): Promise<ConsumerHistory> {
    const interaction = await this.consumerHistoryModel.findById(id);
    if (!interaction) {
      throw new NotFoundException(`Consumer history with ID ${id} not found`);
    }

    const updateData = {
      status: 'completed',
      completedDate: new Date(),
      updatedAt: new Date(),
      ...completionData,
      nextFollowUp: completionData.nextFollowUp
        ? new Date(completionData.nextFollowUp)
        : undefined,
    };

    const updatedInteraction = await this.consumerHistoryModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    return updatedInteraction!;
  }

  async rescheduleInteraction(
    id: string,
    newDate: string,
    reason: string,
    updatedBy: string,
  ): Promise<ConsumerHistory> {
    const interaction = await this.consumerHistoryModel.findById(id);
    if (!interaction) {
      throw new NotFoundException(`Consumer history with ID ${id} not found`);
    }

    const updateData = {
      status: 'rescheduled',
      scheduledDate: new Date(newDate),
      notes: interaction.notes
        ? `${interaction.notes}\n\nRescheduled: ${reason}`
        : `Rescheduled: ${reason}`,
      updatedBy,
      updatedAt: new Date(),
    };

    const updatedInteraction = await this.consumerHistoryModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    return updatedInteraction!;
  }

  async getUpcomingInteractions(
    assignedTo?: string,
    days: number = 7,
  ): Promise<ConsumerHistory[]> {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    const filter: Record<string, any> = {
      status: 'pending',
      scheduledDate: { $gte: fromDate, $lte: toDate },
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.consumerHistoryModel
      .find(filter)
      .sort({ scheduledDate: 1 })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .exec();
  }

  async getOverdueInteractions(
    assignedTo?: string,
  ): Promise<ConsumerHistory[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      status: 'pending',
      scheduledDate: { $lt: now },
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.consumerHistoryModel
      .find(filter)
      .sort({ scheduledDate: -1 })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .exec();
  }

  async getFollowUpsDue(
    assignedTo?: string,
    days: number = 7,
  ): Promise<ConsumerHistory[]> {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    const filter: Record<string, any> = {
      nextFollowUp: { $gte: fromDate, $lte: toDate },
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.consumerHistoryModel
      .find(filter)
      .sort({ nextFollowUp: 1 })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .exec();
  }

  async getConsumerInteractionSummary(consumerId: string): Promise<{
    totalInteractions: number;
    completedInteractions: number;
    pendingInteractions: number;
    lastInteraction?: ConsumerHistory;
    nextFollowUp?: ConsumerHistory;
    interestProgression: string[];
    estimatedBudgetHistory: number[];
  }> {
    const interactions = await this.consumerHistoryModel
      .find({ consumerId })
      .sort({ scheduledDate: -1 })
      .populate('assignedTo', 'name email')
      .exec();

    const summary = {
      totalInteractions: interactions.length,
      completedInteractions: interactions.filter(
        (i) => i.status === 'completed',
      ).length,
      pendingInteractions: interactions.filter((i) => i.status === 'pending')
        .length,
      lastInteraction: interactions[0] || undefined,
      nextFollowUp: interactions.find(
        (i) => i.nextFollowUp && i.nextFollowUp > new Date(),
      ),
      interestProgression: interactions
        .filter((i) => i.interestLevel)
        .map((i) => i.interestLevel!)
        .reverse(),
      estimatedBudgetHistory: interactions
        .filter((i) => i.estimatedBudget)
        .map((i) => i.estimatedBudget!)
        .reverse(),
    };

    return summary;
  }

  async getAdvancedAnalytics(
    assignedTo?: string,
    dateRange?: { fromDate: Date; toDate: Date },
  ) {
    const filter: Record<string, any> = {};
    if (assignedTo) filter.assignedTo = assignedTo;
    if (dateRange) {
      filter.scheduledDate = {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      };
    }

    const [
      interactionTypeStats,
      statusStats,
      priorityStats,
      interestLevelStats,
      outcomeStats,
      monthlyTrends,
      averageBudgetByInterest,
      conversionFunnel,
    ] = await Promise.all([
      // Interaction Type Distribution
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        { $group: { _id: '$interactionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Status Distribution
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Priority Distribution
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Interest Level Distribution
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        { $group: { _id: '$interestLevel', count: { $sum: 1 } } },
      ]),

      // Outcome Distribution
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        { $group: { _id: '$outcome', count: { $sum: 1 } } },
      ]),

      // Monthly Trends
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$scheduledDate' },
              month: { $month: '$scheduledDate' },
            },
            count: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Average Budget by Interest Level
      this.consumerHistoryModel.aggregate([
        {
          $match: { ...filter, estimatedBudget: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: '$interestLevel',
            avgBudget: { $avg: '$estimatedBudget' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Conversion Funnel
      this.consumerHistoryModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            completedInteractions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            highInterest: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      '$interestLevel',
                      ['very_interested', 'ready_to_buy'],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            converted: {
              $sum: { $cond: [{ $eq: ['$outcome', 'converted'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    return {
      interactionTypeStats,
      statusStats,
      priorityStats,
      interestLevelStats,
      outcomeStats,
      monthlyTrends,
      averageBudgetByInterest,
      conversionFunnel: conversionFunnel[0] || {
        totalInteractions: 0,
        completedInteractions: 0,
        highInterest: 0,
        converted: 0,
      },
    };
  }

  async bulkUpdateStatus(
    ids: string[],
    status: string,
    updatedBy: string,
    notes?: string,
  ): Promise<{ updated: number; errors: string[] }> {
    const validStatuses = ['pending', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const errors: string[] = [];
    let updated = 0;

    for (const id of ids) {
      try {
        await this.consumerHistoryModel.findByIdAndUpdate(
          id,
          {
            status,
            updatedBy,
            updatedAt: new Date(),
            ...(notes && { notes }),
            ...(status === 'completed' && { completedDate: new Date() }),
          },
          { runValidators: true },
        );
        updated++;
      } catch (error) {
        errors.push(`Failed to update ${id}: ${error}`);
      }
    }

    return { updated, errors };
  }
}
