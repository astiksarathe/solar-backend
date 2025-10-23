import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  Audit,
  NoAudit,
  HighPriorityAudit,
  ComplianceAudit,
} from '../audit/decorators/audit.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order data',
  })
  @HighPriorityAudit({
    entityType: 'Order',
    module: 'ORDERS',
    category: 'BUSINESS_PROCESS',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @NoAudit()
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter stats by assigned user',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Start date for date range filtering',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'End date for date range filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Order statistics retrieved successfully',
  })
  @NoAudit()
  getStats(
    @Query('assignedTo') assignedTo?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const dateRange =
      fromDate && toDate
        ? {
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
          }
        : undefined;

    return this.ordersService.getOrderStats(assignedTo, dateRange);
  }

  @Get('consumer/:consumerId')
  @ApiOperation({ summary: 'Get orders by consumer ID' })
  @ApiParam({
    name: 'consumerId',
    description: 'Consumer ID to filter orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders for consumer retrieved successfully',
  })
  findByConsumerId(@Param('consumerId') consumerId: string) {
    return this.ordersService.findByConsumerId(consumerId);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get orders by lead ID' })
  @ApiParam({
    name: 'leadId',
    description: 'Lead ID to filter orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders for lead retrieved successfully',
  })
  findByLeadId(@Param('leadId') leadId: string) {
    return this.ordersService.findByLeadId(leadId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update order payment information' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    description: 'Payment update data',
    schema: {
      type: 'object',
      properties: {
        advancePayment: {
          type: 'number',
          description: 'Advance payment amount',
        },
        discount: { type: 'number', description: 'Discount amount' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment information updated successfully',
  })
  @HighPriorityAudit({
    entityType: 'Order',
    module: 'ORDERS',
    category: 'BUSINESS_PROCESS',
    additionalMetadata: { operationType: 'payment_update' },
  })
  updatePayment(
    @Param('id') id: string,
    @Body() paymentUpdate: { advancePayment?: number; discount?: number },
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentUpdate);
  }

  @Patch(':id/installation')
  @ApiOperation({ summary: 'Update order installation information' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    description: 'Installation update data',
    schema: {
      type: 'object',
      properties: {
        estimatedInstallationDate: {
          type: 'string',
          format: 'date',
          description: 'Estimated installation date',
        },
        actualInstallationDate: {
          type: 'string',
          format: 'date',
          description: 'Actual installation start date',
        },
        installationCompletionDate: {
          type: 'string',
          format: 'date',
          description: 'Installation completion date',
        },
        commissioningDate: {
          type: 'string',
          format: 'date',
          description: 'System commissioning date',
        },
        installationTeamLead: {
          type: 'string',
          description: 'Installation team lead name',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Installation information updated successfully',
  })
  updateInstallation(
    @Param('id') id: string,
    @Body()
    installationUpdate: {
      estimatedInstallationDate?: string;
      actualInstallationDate?: string;
      installationCompletionDate?: string;
      commissioningDate?: string;
      installationTeamLead?: string;
    },
  ) {
    // Convert date strings to Date objects
    const update = {
      ...installationUpdate,
      estimatedInstallationDate: installationUpdate.estimatedInstallationDate
        ? new Date(installationUpdate.estimatedInstallationDate)
        : undefined,
      actualInstallationDate: installationUpdate.actualInstallationDate
        ? new Date(installationUpdate.actualInstallationDate)
        : undefined,
      installationCompletionDate: installationUpdate.installationCompletionDate
        ? new Date(installationUpdate.installationCompletionDate)
        : undefined,
      commissioningDate: installationUpdate.commissioningDate
        ? new Date(installationUpdate.commissioningDate)
        : undefined,
    };

    return this.ordersService.updateInstallationStatus(id, update);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status with validation' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    description: 'Status update data',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'draft',
            'pending_approval',
            'confirmed',
            'in_progress',
            'installation_scheduled',
            'installation_in_progress',
            'installation_completed',
            'commissioning',
            'completed',
            'cancelled',
            'on_hold',
          ],
          description: 'New order status',
        },
        updatedBy: {
          type: 'string',
          description: 'User ID who is updating the status',
        },
        notes: {
          type: 'string',
          description: 'Optional notes for status change',
        },
      },
      required: ['status', 'updatedBy'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @HighPriorityAudit({
    entityType: 'Order',
    module: 'ORDERS',
    category: 'BUSINESS_PROCESS',
    additionalMetadata: { operationType: 'status_update' },
  })
  updateStatus(
    @Param('id') id: string,
    @Body() statusUpdate: { status: string; updatedBy: string; notes?: string },
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      statusUpdate.status,
      statusUpdate.updatedBy,
      statusUpdate.notes,
    );
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get order timeline and milestones' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order timeline retrieved successfully',
  })
  getTimeline(@Param('id') id: string) {
    return this.ordersService.getOrderTimeline(id);
  }

  @Post('generate-order-number')
  @ApiOperation({ summary: 'Generate a new order number' })
  @ApiResponse({
    status: 200,
    description: 'Order number generated successfully',
    schema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', example: 'ORD-202412-0001' },
      },
    },
  })
  async generateOrderNumber() {
    const orderNumber = await this.ordersService.generateOrderNumber();
    return { orderNumber };
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate order data for business rules' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation results',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async validateOrder(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    const errors = await this.ordersService.validateOrderData(order);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ComplianceAudit({
    entityType: 'Order',
    module: 'ORDERS',
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
