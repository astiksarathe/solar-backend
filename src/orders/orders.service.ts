import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel({
      ...createOrderDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return order.save();
  }

  async findAll(query: any = {}): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      status,
      priority,
      assignedTo,
      customerName,
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
    if (customerName)
      filter.customerName = { $regex: customerName, $options: 'i' };

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { installationAddress: { $regex: search, $options: 'i' } },
        { systemSize: { $regex: search, $options: 'i' } },
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
      this.orderModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('leadId', 'customerName status')
        .populate('consumerId', 'name phone email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('leadId', 'customerName status interestLevel')
      .populate('consumerId', 'name phone email address')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByConsumerId(consumerId: string): Promise<Order[]> {
    return this.orderModel
      .find({ consumerId })
      .sort({ createdAt: -1 })
      .populate('leadId', 'customerName status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }

  async findByLeadId(leadId: string): Promise<Order[]> {
    return this.orderModel
      .find({ leadId })
      .sort({ createdAt: -1 })
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        id,
        { ...updateOrderDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .populate('leadId', 'customerName status')
      .populate('consumerId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  async calculateTotalCost(costBreakdown: any[]): Promise<number> {
    return costBreakdown.reduce(
      (total, item) => total + (item.totalPrice || 0),
      0,
    );
  }

  async updatePaymentStatus(
    orderId: string,
    paymentUpdate: {
      advancePayment?: number;
      discount?: number;
    },
  ): Promise<Order | null> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const pricing = order.pricing || {};
    const updatedPricing = {
      ...pricing,
      advancePayment: paymentUpdate.advancePayment || pricing.advancePayment,
      discount: paymentUpdate.discount || pricing.discount,
    };
    
    // Recalculate remaining amount
    updatedPricing.remainingAmount = updatedPricing.total - updatedPricing.advancePayment;

    return this.orderModel
      .findByIdAndUpdate(
        orderId,
        { pricing: updatedPricing, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async updateInstallationStatus(
    orderId: string,
    installationUpdate: {
      estimatedInstallationDate?: Date;
      actualInstallationDate?: Date;
      installationCompletionDate?: Date;
      commissioningDate?: Date;
      installationTeamLead?: string;
    },
  ): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          ...installationUpdate,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async getOrderStats(
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

    const [statusStats, monthlyRevenue, systemSizeStats] = await Promise.all([
      this.orderModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: {
              $sum: {
                $cond: [
                  { $ifNull: ['$pricing.total', false] },
                  '$pricing.total',
                  0,
                ],
              },
            },
          },
        },
      ]),
      this.orderModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $ifNull: ['$pricing.total', false] },
                  '$pricing.total',
                  0,
                ],
              },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.orderModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$systemSize',
            count: { $sum: 1 },
            avgValue: {
              $avg: {
                $cond: [
                  { $ifNull: ['$pricing.total', false] },
                  '$pricing.total',
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    return {
      statusStats,
      monthlyRevenue,
      systemSizeStats,
    };
  }
}
