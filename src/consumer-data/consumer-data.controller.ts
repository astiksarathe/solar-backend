import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsumerDataService } from './consumer-data.service';
import { CreateConsumerDatumDto } from './dto/create-consumer-datum.dto';
import { UpdateConsumerDatumDto } from './dto/update-consumer-datum.dto';

@Controller('consumer-data')
export class ConsumerDataController {
  constructor(private readonly consumerDataService: ConsumerDataService) {}

  @Post()
  create(@Body() createConsumerDatumDto: CreateConsumerDatumDto) {
    return this.consumerDataService.create(createConsumerDatumDto);
  }

  @Get()
  findAll() {
    return this.consumerDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumerDataService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumerDatumDto: UpdateConsumerDatumDto) {
    return this.consumerDataService.update(+id, updateConsumerDatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumerDataService.remove(+id);
  }
}
