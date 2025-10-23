import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateConsumerDataDto } from './create-consumer-data.dto';

/**
 * DTO for updating existing consumer data records
 * All fields are optional for partial updates
 */
export class UpdateConsumerDataDto extends PartialType(CreateConsumerDataDto) {
  @ApiPropertyOptional({
    description: 'Update processing status',
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
  })
  @IsOptional()
  @IsEnum([
    'new',
    'contacted',
    'interested',
    'not_interested',
    'converted',
    'invalid',
  ])
  status?: string;

  @ApiPropertyOptional({
    description: 'Whether this consumer has been converted to a lead',
  })
  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @ApiPropertyOptional({
    description: 'Add new notes to existing notes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalNotes?: string[];

  @ApiPropertyOptional({
    description: 'Update preferred contact language',
    enum: [
      'hindi',
      'english',
      'marathi',
      'gujarati',
      'punjabi',
      'tamil',
      'telugu',
      'bengali',
    ],
  })
  @IsOptional()
  @IsEnum([
    'hindi',
    'english',
    'marathi',
    'gujarati',
    'punjabi',
    'tamil',
    'telugu',
    'bengali',
  ])
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Update best contact time',
    enum: ['morning', 'afternoon', 'evening', 'any'],
  })
  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening', 'any'])
  bestContactTime?: string;

  @ApiPropertyOptional({
    description: 'Manual override for qualification score',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualificationScoreOverride?: number;
}
