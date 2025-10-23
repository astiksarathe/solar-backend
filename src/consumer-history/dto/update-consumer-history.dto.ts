import { PartialType } from '@nestjs/swagger';
import { CreateConsumerHistoryDto } from './create-consumer-history.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId } from 'class-validator';

export class UpdateConsumerHistoryDto extends PartialType(
  CreateConsumerHistoryDto,
) {
  @ApiPropertyOptional({
    description: 'User who updated this record',
    example: '675b8e5a1234567890abcd01',
  })
  @IsOptional()
  @IsMongoId()
  updatedBy?: string;
}
