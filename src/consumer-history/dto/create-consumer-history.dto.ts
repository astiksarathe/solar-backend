import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsMongoId,
  IsEmail,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsumerHistoryDto {
  @ApiProperty({
    description: 'Consumer ID reference',
    example: '675b8e5a1234567890abcdef',
  })
  @IsMongoId()
  consumerId: string;

  @ApiProperty({
    description: 'Consumer number for reference',
    example: 'CONS-001',
  })
  @IsString()
  consumerNumber: string;

  @ApiProperty({
    description: 'Type of interaction with consumer',
    enum: [
      'call',
      'meeting',
      'site_visit',
      'email',
      'whatsapp',
      'follow_up',
      'quote_sent',
      'proposal_sent',
      'survey',
      'installation_visit',
      'maintenance',
      'complaint',
      'payment_follow_up',
    ],
    example: 'call',
  })
  @IsEnum([
    'call',
    'meeting',
    'site_visit',
    'email',
    'whatsapp',
    'follow_up',
    'quote_sent',
    'proposal_sent',
    'survey',
    'installation_visit',
    'maintenance',
    'complaint',
    'payment_follow_up',
  ])
  interactionType: string;

  @ApiPropertyOptional({
    description: 'Status of the interaction',
    enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled', 'rescheduled'])
  status?: string;

  @ApiProperty({
    description: 'Title or subject of the interaction',
    example: 'Initial consultation call',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the interaction',
    example:
      'Discussed solar panel requirements and energy consumption patterns',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional notes from the interaction',
    example: 'Customer very interested, wants site survey scheduled',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Scheduled date and time for the interaction',
    example: '2024-12-25T10:00:00Z',
  })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({
    description: 'Actual completion date of the interaction',
    example: '2024-12-25T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({
    description: 'Duration of interaction in minutes',
    example: 30,
    minimum: 1,
    maximum: 480,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Location where interaction took place',
    example: 'Customer residence - 123 Green Valley, Gurgaon',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Primary contact person during interaction',
    example: 'Rajesh Sharma',
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({
    description: 'Phone number used for interaction',
    example: '+91 9876543210',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address used for interaction',
    example: 'rajesh.sharma@email.com',
  })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional({
    description: 'Customer interest level after interaction',
    enum: [
      'not_interested',
      'low_interest',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
      'comparing_options',
      'budget_constraints',
    ],
    example: 'very_interested',
  })
  @IsOptional()
  @IsEnum([
    'not_interested',
    'low_interest',
    'interested',
    'very_interested',
    'ready_to_buy',
    'needs_time',
    'price_negotiation',
    'comparing_options',
    'budget_constraints',
  ])
  interestLevel?: string;

  @ApiPropertyOptional({
    description: 'Next follow-up date if needed',
    example: '2025-01-05T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @ApiPropertyOptional({
    description: 'Estimated budget discussed in INR',
    example: 500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @ApiPropertyOptional({
    description: 'System size discussed or recommended',
    example: '5kW',
  })
  @IsOptional()
  @IsString()
  systemSize?: string;

  @ApiPropertyOptional({
    description: 'File attachments related to interaction',
    example: ['quote.pdf', 'site_survey.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({
    description: 'User assigned to handle this interaction',
    example: '675b8e5a1234567890abcd01',
  })
  @IsMongoId()
  assignedTo: string;

  @ApiProperty({
    description: 'User who created this interaction record',
    example: '675b8e5a1234567890abcd01',
  })
  @IsMongoId()
  createdBy: string;

  @ApiPropertyOptional({
    description: 'User who last updated this record',
    example: '675b8e5a1234567890abcd01',
  })
  @IsOptional()
  @IsMongoId()
  updatedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional custom fields for specific use cases',
    example: {
      roofType: 'concrete',
      shadowIssues: false,
      electricityBill: 8000,
    },
  })
  @IsOptional()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Priority level of this interaction',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Outcome or result of the interaction',
    enum: [
      'successful',
      'needs_follow_up',
      'rejected',
      'postponed',
      'converted',
      'no_response',
      'information_gathering',
    ],
  })
  @IsOptional()
  @IsEnum([
    'successful',
    'needs_follow_up',
    'rejected',
    'postponed',
    'converted',
    'no_response',
    'information_gathering',
  ])
  outcome?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization and filtering',
    example: ['hot_lead', 'residential', 'premium'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
