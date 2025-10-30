import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolarProjectService } from './solar-project.service';
import { SolarProjectController } from './solar-project.controller';
import {
  SolarProject,
  SolarProjectSchema,
} from '../schemas/solar-project.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SolarProject.name, schema: SolarProjectSchema },
    ]),
  ],
  controllers: [SolarProjectController],
  providers: [SolarProjectService],
})
export class SolarProjectModule {}
