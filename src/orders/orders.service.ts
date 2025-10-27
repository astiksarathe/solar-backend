import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

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

  async findAll(query: QueryOrderDto = {}): Promise<{
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

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('consumerId', 'name phone email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
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

  // New business logic methods
  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    updatedBy: string,
    notes?: string,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate status transition
    const validTransitions = this.getValidStatusTransitions(order.status);
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          status: newStatus,
          updatedBy,
          updatedAt: new Date(),
          ...(notes && { notes }),
        },
        { new: true, runValidators: true },
      )
      .exec();

    return updatedOrder!;
  }

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      draft: ['pending_approval', 'cancelled'],
      pending_approval: ['confirmed', 'draft', 'cancelled'],
      confirmed: ['in_progress', 'cancelled', 'on_hold'],
      in_progress: ['installation_scheduled', 'on_hold', 'cancelled'],
      installation_scheduled: ['installation_in_progress', 'on_hold'],
      installation_in_progress: ['installation_completed', 'on_hold'],
      installation_completed: ['commissioning'],
      commissioning: ['completed'],
      on_hold: ['in_progress', 'installation_scheduled', 'cancelled'],
      cancelled: [],
      completed: [],
    };

    return transitions[currentStatus] || [];
  }

  async getOrderTimeline(orderId: string): Promise<any[]> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const timeline = [
      {
        event: 'Order Created',
        timestamp: (order as any).createdAt,
        status: 'draft',
        description: 'Order was created in the system',
      },
    ];

    // Add installation milestones
    if (order.estimatedInstallationDate) {
      timeline.push({
        event: 'Installation Scheduled',
        timestamp: order.estimatedInstallationDate,
        status: 'installation_scheduled',
        description: 'Installation date scheduled',
      });
    }

    if (order.actualInstallationDate) {
      timeline.push({
        event: 'Installation Started',
        timestamp: order.actualInstallationDate,
        status: 'installation_in_progress',
        description: 'Installation work began',
      });
    }

    if (order.installationCompletionDate) {
      timeline.push({
        event: 'Installation Completed',
        timestamp: order.installationCompletionDate,
        status: 'installation_completed',
        description: 'Installation work completed',
      });
    }

    if (order.commissioningDate) {
      timeline.push({
        event: 'System Commissioned',
        timestamp: order.commissioningDate,
        status: 'commissioning',
        description: 'Solar system commissioned and activated',
      });
    }

    return timeline.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  async validateOrderData(orderData: any): Promise<string[]> {
    const errors: string[] = [];

    // Validate system capacity vs pricing
    if (orderData.systemCapacity && orderData.pricing?.total) {
      const costPerKW = orderData.pricing.total / orderData.systemCapacity;
      if (costPerKW < 40000 || costPerKW > 100000) {
        errors.push(
          'Cost per kW seems unusual (expected range: ₹40,000 - ₹1,00,000)',
        );
      }
    }

    // Validate installation dates
    if (
      orderData.estimatedInstallationDate &&
      orderData.actualInstallationDate
    ) {
      const estimated = new Date(orderData.estimatedInstallationDate);
      const actual = new Date(orderData.actualInstallationDate);
      if (actual < estimated) {
        errors.push(
          'Actual installation date cannot be before estimated date',
        );
      }
    }

    // Validate payment amounts
    if (orderData.pricing) {
      const { total, advancePayment, discount } = orderData.pricing;
      if (advancePayment && total && advancePayment > total) {
        errors.push('Advance payment cannot exceed total amount');
      }
      if (discount && total && discount > total * 0.3) {
        errors.push('Discount cannot exceed 30% of total amount');
      }
    }

    return errors;
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Get the count of orders this month
    const monthStart = new Date(year, new Date().getMonth(), 1);
    const monthEnd = new Date(year, new Date().getMonth() + 1, 0);

    const monthlyCount = await this.orderModel.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd },
    });

    const sequence = String(monthlyCount + 1).padStart(4, '0');
    return `ORD-${year}${month}-${sequence}`;
  }
}
