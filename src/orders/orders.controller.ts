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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get('stats')
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
  findByConsumerId(@Param('consumerId') consumerId: string) {
    return this.ordersService.findByConsumerId(consumerId);
  }

  @Get('lead/:leadId')
  findByLeadId(@Param('leadId') leadId: string) {
    return this.ordersService.findByLeadId(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id') id: string,
    @Body() paymentUpdate: { advancePayment?: number; discount?: number },
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentUpdate);
  }

  @Patch(':id/installation')
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
