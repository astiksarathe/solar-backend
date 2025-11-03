import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from '../schemas/reminder.model';
import {
  UpdateReminderDto,
  CompleteReminderDto,
  RescheduleReminderDto,
  AddCommunicationDto,
  AddDocumentDto,
  CustomerFeedbackDto,
  CreateReminderDto,
  QueryReminderDto,
} from './dto';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
  ) {}

  // ===============================
  // 🟩 CREATE
  // ===============================
  async create(dto: CreateReminderDto): Promise<ReminderDocument> {
    try {
      const reminder = new this.reminderModel({
        ...dto,
        communicationHistory: [],
        documents: [],
        tags: dto.tags || [],
        rescheduleCount: 0,
      });
      return await reminder.save();
    } catch (error: unknown) {
      this.logger.error(`Failed to create reminder: ${error as any}`);
      throw new BadRequestException('Failed to create reminder');
    }
  }

  // ===============================
  // 🟨 GET ALL (with filter/sort/pagination)
  // ===============================
  async findAll(query: QueryReminderDto): Promise<{
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
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.reminderModel
        .find(filter)
        .populate('entityId')
        .populate('assignedTo', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
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

  // ===============================
  // 🟦 GET BY ID
  // ===============================
  async findOne(id: string): Promise<ReminderDocument> {
    const reminder = await this.reminderModel
      .findById(id)
      .populate('entityId')
      .populate('assignedTo', 'username email')
      .exec();

    if (!reminder)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return reminder;
  }

  // ===============================
  // 🟧 UPDATE
  // ===============================
  async update(id: string, dto: UpdateReminderDto): Promise<ReminderDocument> {
    const updated = await this.reminderModel
      .findByIdAndUpdate(id, { ...dto, updatedAt: new Date() }, { new: true })
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // 🟥 DELETE
  // ===============================
  async remove(id: string): Promise<void> {
    const deleted = await this.reminderModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
  }

  // ===============================
  // 📞 COMMUNICATION
  // ===============================
  async addCommunication(
    id: string,
    dto: AddCommunicationDto,
  ): Promise<ReminderDocument> {
    const communication = { ...dto, timestamp: new Date() };

    const updated = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          $push: { communicationHistory: communication },
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // 📎 DOCUMENT MANAGEMENT
  // ===============================
  async addDocument(
    id: string,
    dto: AddDocumentDto,
  ): Promise<ReminderDocument> {
    const updated = await this.reminderModel
      .findByIdAndUpdate(
        id,
        { $push: { documents: dto.url }, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // ✅ COMPLETE
  // ===============================
  async completeReminder(
    id: string,
    dto: CompleteReminderDto,
  ): Promise<ReminderDocument> {
    const updated = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          status: 'completed',
          completedAt: new Date(),
          remarks: dto.completionNotes,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // 📅 RESCHEDULE
  // ===============================
  async rescheduleReminder(
    id: string,
    dto: RescheduleReminderDto,
  ): Promise<ReminderDocument> {
    const reminder = await this.findOne(id);

    const updated = await this.reminderModel
      .findByIdAndUpdate(
        id,
        {
          scheduledAt: new Date(dto.newScheduledAt),
          rescheduledAt: new Date(),
          $inc: { rescheduleCount: 1 },
          remarks: dto.reason,
          status: 'rescheduled',
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // ⭐ FEEDBACK
  // ===============================
  async addCustomerFeedback(
    id: string,
    dto: CustomerFeedbackDto,
  ): Promise<ReminderDocument> {
    const feedback = {
      feedbackBy: dto.feedbackBy,
      rating: dto.rating,
      comments: dto.comments,
    };

    const updated = await this.reminderModel
      .findByIdAndUpdate(
        id,
        { $push: { feedback: feedback }, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    return updated;
  }

  // ===============================
  // 📊 ANALYTICS
  // ===============================
  async getUpcomingReminders(
    assignedTo?: string,
    days = 7,
    limit = 50,
  ): Promise<ReminderDocument[]> {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + days);

    const filter: Record<string, any> = {
      scheduledAt: { $gte: now, $lte: end },
      status: 'pending',
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.reminderModel
      .find(filter)
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .populate('entityId', 'name')
      .exec();
  }

  async getOverdueReminders(
    assignedTo?: string,
    limit = 50,
  ): Promise<ReminderDocument[]> {
    const now = new Date();
    const filter: any = {
      scheduledAt: { $lt: now },
      status: 'pending',
    };

    if (assignedTo) filter.assignedTo = assignedTo;

    return this.reminderModel
      .find(filter)
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .populate('entityId', 'name')
      .exec();
  }

  // ===============================
  // 🧠 FILTER HELPER
  // ===============================
  private buildFilterQuery(query: QueryReminderDto): Record<string, any> {
    const filter: Record<string, any> = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.entityId) filter.entityId = new Types.ObjectId(query.entityId);
    if (query.entityModel) filter.entityModel = query.entityModel;

    // Date range
    if (query.fromDate || query.toDate) {
      const range: any = {};
      if (query.fromDate) range.$gte = new Date(query.fromDate);
      if (query.toDate) range.$lte = new Date(query.toDate);
      filter.scheduledAt = range;
    }

    // Text search
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { remarks: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Tags
    if (query.tags) {
      const tags = query.tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tags };
    }

    // Overdue or today
    if (query.overdue) {
      filter.status = 'pending';
      filter.scheduledAt = { $lt: new Date() };
    }

    if (query.dueToday) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.scheduledAt = { $gte: start, $lte: end };
    }

    return filter;
  }
}
