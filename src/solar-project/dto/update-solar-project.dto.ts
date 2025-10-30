import { PartialType } from '@nestjs/mapped-types';
import { CreateSolarProjectDto } from './create-solar-project.dto';

export class UpdateSolarProjectDto extends PartialType(CreateSolarProjectDto) {}
