import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from '../schemas/reminder.schema';
import { CreateReminderDto } from './dto/create-reminder.dto';
import {
  UpdateReminderDto,
  CompleteReminderDto,
  RescheduleReminderDto,
  AddCommunicationDto,
  AddDocumentDto,
  CustomerFeedbackDto,
} from './dto/update-reminder.dto';
import { QueryReminderDto } from './dto/query-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name)
    private reminderModel: Model<ReminderDocument>,
  ) {}

  // === BASIC CRUD OPERATIONS ===

  async create(
    createReminderDto: CreateReminderDto,
  ): Promise<ReminderDocument> {
    const reminderData = {
      ...createReminderDto,
      communicationHistory: [],
      documents: [],
      preparationItems: [],
      teamMembers: [],
      followUpActions: [],
      rescheduleHistory: [],
      notificationHistory: [],
      qualityChecklist: [],
      tags: createReminderDto.tags || [],
      rescheduleCount: 0,
    };

    const reminder = new this.reminderModel(reminderData);
    return reminder.save();
  }

  async findAll(query: QueryReminderDto = {}): Promise<{
    data: ReminderDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'scheduledAt',
      sortOrder = 'asc',
    } = query;

    const filter = this.buildFilterQuery(query);
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.reminderModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('entityId')
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

  async findOne(id: string): Promise<ReminderDocument> {
    const reminder = await this.reminderModel
      .findById(id)
      .populate('entityId')
      .populate('parentReminderId')
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async update(
    id: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<ReminderDocument> {
    const updateData = {
      ...updateReminderDto,
      updatedAt: new Date(),
    };

    const updatedReminder = await this.reminderModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!updatedReminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return updatedReminder;
  }

  async remove(id: string): Promise<void> {
    // Handle child reminders
    await this.reminderModel.updateMany(
      { parentReminderId: id },
      { $unset: { parentReminderId: 1 } },
    );

    const result = await this.reminderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }
  }

  // === COMMUNICATION MANAGEMENT ===

  async addCommunication(
    id: string,
    communicationDto: AddCommunicationDto,
  ): Promise<ReminderDocument> {
    const communication = {
      ...communicationDto,
      timestamp: new Date(),
      followUpRequired: false,
      attachments: [],
    };

    const reminder = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          $push: { communicationHistory: communication },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  // === DOCUMENT MANAGEMENT ===

  async addDocument(
    id: string,
    documentDto: AddDocumentDto,
  ): Promise<ReminderDocument> {
    const document = {
      ...documentDto,
      obtained: true,
      uploadedAt: new Date(),
      version: 1,
    };

    const reminder = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          $push: { documents: document },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  // === COMPLETION AND QUALITY MANAGEMENT ===

  async completeReminder(
    id: string,
    completeDto: CompleteReminderDto,
  ): Promise<ReminderDocument> {
    const updateData = {
      status: 'completed',
      completedAt: new Date(),
      outcome: completeDto.outcome,
      completionNotes: completeDto.completionNotes,
      actualDuration: completeDto.actualDuration,
      qualityRating: completeDto.qualityRating,
      completedBy: completeDto.completedBy,
      updatedAt: new Date(),
    };

    const reminder = await this.reminderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async addCustomerFeedback(
    id: string,
    feedbackDto: CustomerFeedbackDto,
  ): Promise<ReminderDocument> {
    const feedback = {
      ...feedbackDto,
      collectedAt: new Date(),
    };

    const reminder = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            customerFeedback: feedback,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  // === RESCHEDULING ===

  async rescheduleReminder(
    id: string,
    rescheduleDto: RescheduleReminderDto,
  ): Promise<ReminderDocument> {
    const reminder = await this.findOne(id);

    const rescheduleRecord = {
      fromDate: reminder.scheduledAt,
      toDate: new Date(rescheduleDto.newScheduledAt),
      reason: rescheduleDto.reason,
      rescheduledBy: rescheduleDto.rescheduledBy,
      rescheduledAt: new Date(),
    };

    const updateData = {
      rescheduledFrom: reminder.scheduledAt,
      scheduledAt: new Date(rescheduleDto.newScheduledAt),
      rescheduleReason: rescheduleDto.reason,
      status: 'rescheduled',
      $inc: { rescheduleCount: 1 },
      $push: { rescheduleHistory: rescheduleRecord },
      updatedAt: new Date(),
    };

    if (!reminder.originalScheduledAt) {
      (updateData as any).originalScheduledAt = reminder.scheduledAt;
    }

    const updatedReminder = await this.reminderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updatedReminder!;
  }

  // === ANALYTICS AND REPORTING ===

  async getUpcomingReminders(
    assignedTo?: string,
    days: number = 7,
    limit: number = 50,
  ): Promise<ReminderDocument[]> {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    const filter: Record<string, any> = {
      scheduledAt: { $gte: fromDate, $lte: toDate },
      status: 'pending',
    };

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    return this.reminderModel
      .find(filter)
      .sort({ scheduledAt: 1, priority: -1 })
      .limit(limit)
      .populate('entityId', 'name customerName orderNumber')
      .exec();
  }

  async getOverdueReminders(
    assignedTo?: string,
    limit: number = 50,
  ): Promise<ReminderDocument[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      scheduledAt: { $lt: now },
      status: { $in: ['pending', 'in_progress'] },
    };

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    return this.reminderModel
      .find(filter)
      .sort({ scheduledAt: 1, priority: -1 })
      .limit(limit)
      .populate('entityId', 'name customerName orderNumber')
      .exec();
  }

  async getReminderStats(
    assignedTo?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<any> {
    const filter: Record<string, any> = {};

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = fromDate;
      if (toDate) filter.createdAt.$lte = toDate;
    }

    const [statusStats, typeStats, priorityStats] = await Promise.all([
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
    ]);

    return {
      statusStats,
      typeStats,
      priorityStats,
    };
  }

  // === HELPER METHODS ===

  private buildFilterQuery(query: QueryReminderDto): Record<string, any> {
    const filter: Record<string, any> = {};

    // Basic filters
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.department) filter.department = query.department;
    if (query.entityId) filter.entityId = new Types.ObjectId(query.entityId);
    if (query.entityModel) filter.entityModel = query.entityModel;
    if (query.category) filter.category = query.category;
    if (query.businessImpact) filter.businessImpact = query.businessImpact;
    if (query.outcome) filter.outcome = query.outcome;
    if (query.createdBy) filter.createdBy = query.createdBy;
    if (query.completedBy) filter.completedBy = query.completedBy;

    // Boolean filters
    if (query.isCritical !== undefined) filter.isCritical = query.isCritical;
    if (query.isRecurring !== undefined) filter.isRecurring = query.isRecurring;
    if (query.weatherDependent !== undefined)
      filter.weatherDependent = query.weatherDependent;

    // Date filters
    if (query.fromDate || query.toDate) {
      const scheduledAtFilter: Record<string, Date> = {};
      if (query.fromDate) scheduledAtFilter.$gte = new Date(query.fromDate);
      if (query.toDate) scheduledAtFilter.$lte = new Date(query.toDate);
      filter.scheduledAt = scheduledAtFilter;
    }

    if (query.completedFromDate || query.completedToDate) {
      const completedAtFilter: Record<string, Date> = {};
      if (query.completedFromDate)
        completedAtFilter.$gte = new Date(query.completedFromDate);
      if (query.completedToDate)
        completedAtFilter.$lte = new Date(query.completedToDate);
      filter.completedAt = completedAtFilter;
    }

    // Search
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { completionNotes: { $regex: query.search, $options: 'i' } },
        {
          'contactDetails.customerName': {
            $regex: query.search,
            $options: 'i',
          },
        },
      ];
    }

    // Tags
    if (query.tags) {
      const tags = query.tags.split(',').map((tag) => tag.trim());
      filter.tags = { $in: tags };
    }

    // Special date filters
    if (query.overdue) {
      filter.scheduledAt = { $lt: new Date() };
      filter.status = { $in: ['pending', 'in_progress'] };
    }

    if (query.dueToday) {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      filter.scheduledAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Backward compatibility
    if (query.relatedConsumerId) {
      filter.$or = [
        {
          entityId: new Types.ObjectId(query.relatedConsumerId),
          entityModel: 'ConsumerData',
        },
      ];
    }

    if (query.relatedOrderId) {
      filter.$or = [
        {
          entityId: new Types.ObjectId(query.relatedOrderId),
          entityModel: 'Order',
        },
      ];
    }

    return filter;
  }
}
