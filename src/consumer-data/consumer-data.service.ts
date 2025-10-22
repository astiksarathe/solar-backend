import { Injectable } from '@nestjs/common';
import { CreateConsumerDatumDto } from './dto/create-consumer-datum.dto';
import { UpdateConsumerDatumDto } from './dto/update-consumer-datum.dto';

@Injectable()
export class ConsumerDataService {
  create(createConsumerDatumDto: CreateConsumerDatumDto) {
    return 'This action adds a new consumerDatum';
  }

  findAll() {
    return `This action returns all consumerData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} consumerDatum`;
  }

  update(id: number, updateConsumerDatumDto: UpdateConsumerDatumDto) {
    return `This action updates a #${id} consumerDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} consumerDatum`;
  }
}
