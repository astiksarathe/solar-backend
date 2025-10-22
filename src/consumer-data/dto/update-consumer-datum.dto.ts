import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumerDatumDto } from './create-consumer-datum.dto';

export class UpdateConsumerDatumDto extends PartialType(CreateConsumerDatumDto) {}
