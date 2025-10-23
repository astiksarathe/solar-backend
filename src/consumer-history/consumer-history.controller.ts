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
import { ConsumerHistoryService } from './consumer-history.service';
import { CreateConsumerHistoryDto } from './dto/create-consumer-history.dto';
import { UpdateConsumerHistoryDto } from './dto/update-consumer-history.dto';
import { QueryConsumerHistoryDto } from './dto/query-consumer-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consumer-history')
@UseGuards(JwtAuthGuard)
export class ConsumerHistoryController {
  constructor(
    private readonly consumerHistoryService: ConsumerHistoryService,
  ) {}

  @Post()
  create(@Body() createConsumerHistoryDto: CreateConsumerHistoryDto) {
    return this.consumerHistoryService.create(createConsumerHistoryDto);
  }

  @Get()
  findAll(@Query() query: QueryConsumerHistoryDto) {
    return this.consumerHistoryService.findAll(query);
  }

  @Get('stats')
  getStats(
    @Query('consumerId') consumerId?: string,
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

    return this.consumerHistoryService.getInteractionStats(
      consumerId,
      dateRange,
    );
  }

  @Get('consumer/:consumerId')
  findByConsumerId(@Param('consumerId') consumerId: string) {
    return this.consumerHistoryService.findByConsumerId(consumerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumerHistoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsumerHistoryDto: UpdateConsumerHistoryDto,
  ) {
    return this.consumerHistoryService.update(id, updateConsumerHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumerHistoryService.remove(id);
  }
}
