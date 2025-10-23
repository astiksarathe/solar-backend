import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name)
    private reminderModel: Model<Reminder>,
  ) {}

  async create(createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = new this.reminderModel({
      ...createReminderDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return reminder.save();
  }

  async findAll(query: any = {}): Promise<{
    data: Reminder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      type,
      status,
      priority,
      assignedTo,
      relatedConsumerId,
      relatedLeadId,
      relatedOrderId,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'reminderDate',
      sortOrder = 'asc',
    } = query;

    const filter: Record<string, any> = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (relatedConsumerId) filter.relatedConsumerId = relatedConsumerId;
    if (relatedLeadId) filter.relatedLeadId = relatedLeadId;
    if (relatedOrderId) filter.relatedOrderId = relatedOrderId;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (fromDate || toDate) {
      filter.reminderDate = {};
      if (fromDate) filter.reminderDate.$gte = new Date(fromDate);
      if (toDate) filter.reminderDate.$lte = new Date(toDate);
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.reminderModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('relatedConsumerId', 'name phone email')
        .populate('relatedLeadId', 'customerName status')
        .populate('relatedOrderId', 'orderNumber status')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .exec(),
      this.reminderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Reminder> {
    const reminder = await this.reminderModel
      .findById(id)
      .populate('relatedConsumerId', 'name phone email address')
      .populate('relatedLeadId', 'customerName status priority')
      .populate('relatedOrderId', 'orderNumber status customerName')
      .populate('relatedHistoryId', 'title interactionType status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async findByAssignedTo(assignedTo: string): Promise<Reminder[]> {
    return this.reminderModel
      .find({ assignedTo, status: { $ne: 'completed' } })
      .sort({ reminderDate: 1 })
      .populate('relatedConsumerId', 'name phone')
      .populate('relatedLeadId', 'customerName status')
      .populate('relatedOrderId', 'orderNumber status')
      .exec();
  }

  async findOverdueReminders(): Promise<Reminder[]> {
    const now = new Date();
    return this.reminderModel
      .find({
        reminderDate: { $lt: now },
        status: { $in: ['pending', 'snoozed'] },
      })
      .sort({ reminderDate: 1 })
      .populate('assignedTo', 'name email')
      .populate('relatedConsumerId', 'name phone')
      .populate('relatedLeadId', 'customerName')
      .populate('relatedOrderId', 'orderNumber')
      .exec();
  }

  async findUpcomingReminders(
    assignedTo?: string,
    hours: number = 24,
  ): Promise<Reminder[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const filter: Record<string, any> = {
      reminderDate: { $gte: now, $lte: futureTime },
      status: 'pending',
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.reminderModel
      .find(filter)
      .sort({ reminderDate: 1 })
      .populate('assignedTo', 'name email')
      .populate('relatedConsumerId', 'name phone')
      .populate('relatedLeadId', 'customerName')
      .populate('relatedOrderId', 'orderNumber')
      .exec();
  }

  async update(
    id: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    const updatedReminder = await this.reminderModel
      .findByIdAndUpdate(
        id,
        { ...updateReminderDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .populate('relatedConsumerId', 'name phone email')
      .populate('relatedLeadId', 'customerName status')
      .populate('relatedOrderId', 'orderNumber status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!updatedReminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return updatedReminder;
  }

  async markAsCompleted(id: string): Promise<Reminder> {
    return this.update(id, {
      status: 'completed',
      updatedAt: new Date(),
    } as UpdateReminderDto);
  }

  async snoozeReminder(
    id: string,
    snoozeMinutes: number,
  ): Promise<Reminder> {
    const currentTime = new Date();
    const newReminderDate = new Date(
      currentTime.getTime() + snoozeMinutes * 60 * 1000,
    );

    return this.update(id, {
      status: 'snoozed',
      reminderDate: newReminderDate.toISOString(),
    } as UpdateReminderDto);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reminderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }
  }

  async createFollowUpReminder(
    relatedEntityId: string,
    entityType: 'consumer' | 'lead' | 'order',
    assignedTo: string,
    createdBy: string,
    followUpDays: number = 3,
  ): Promise<Reminder> {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + followUpDays);

    const reminderData: Partial<CreateReminderDto> = {
      type: 'follow_up_call',
      title: `Follow up on ${entityType}`,
      description: `Scheduled follow-up for ${entityType}`,
      reminderDate: reminderDate.toISOString(),
      priority: 'medium',
      assignedTo,
      createdBy,
    };

    switch (entityType) {
      case 'consumer':
        reminderData.relatedConsumerId = relatedEntityId;
        break;
      case 'lead':
        reminderData.relatedLeadId = relatedEntityId;
        break;
      case 'order':
        reminderData.relatedOrderId = relatedEntityId;
        break;
    }

    return this.create(reminderData as CreateReminderDto);
  }

  async getReminderStats(
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

    const [statusStats, typeStats, priorityStats, overdueCount] =
      await Promise.all([
        this.reminderModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        this.reminderModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
            },
          },
        ]),
        this.reminderModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 },
            },
          },
        ]),
        this.reminderModel.countDocuments({
          ...filter,
          reminderDate: { $lt: new Date() },
          status: { $in: ['pending', 'snoozed'] },
        }),
      ]);

    return {
      statusStats,
      typeStats,
      priorityStats,
      overdueCount,
    };
  }
}
