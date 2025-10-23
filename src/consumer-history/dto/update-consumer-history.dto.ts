import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumerHistoryDto } from './create-consumer-history.dto';

export class UpdateConsumerHistoryDto extends PartialType(CreateConsumerHistoryDto) {}
