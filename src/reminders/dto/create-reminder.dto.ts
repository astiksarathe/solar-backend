import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsISO8601()
  reminder_at: string;

  @IsOptional()
  @IsString()
  reminder_note?: string;

  @IsOptional()
  @IsString()
  reminder_type?: string;
}
