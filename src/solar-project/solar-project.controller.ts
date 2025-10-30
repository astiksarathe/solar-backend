import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { SolarProjectService } from './solar-project.service';
import {
  CreateSolarProjectDto,
  UpdateSolarProjectDto,
  QuerySolarProjectDto,
  SolarProjectResponseDto,
} from './dto/index.dto';

@Controller('solar-project')
export class SolarProjectController {
  constructor(private readonly solarProjectService: SolarProjectService) {}

  /**
   * 📌 Create a new Solar Project
   */
  @Post()
  async create(
    @Body() createSolarProjectDto: CreateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    try {
      return await this.solarProjectService.create(createSolarProjectDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Failed to create solar project');
    }
  }

  /**
   * 📋 Get all projects with search, sorting & pagination
   */
  @Get()
  async findAll(@Query() query: QuerySolarProjectDto) {
    try {
      return await this.solarProjectService.findAll(query);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Failed to fetch solar projects');
    }
  }

  /**
   * 🔍 Get a specific project by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SolarProjectResponseDto> {
    try {
      return await this.solarProjectService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Failed to fetch solar project');
    }
  }

  /**
   * ✏️ Update a Solar Project
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSolarProjectDto,
  ): Promise<SolarProjectResponseDto> {
    try {
      return await this.solarProjectService.update(id, updateDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Failed to update solar project');
    }
  }

  /**
   * 🗑️ Soft delete a Solar Project
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.solarProjectService.remove(id);
      return { message: 'Solar project deleted successfully' };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Failed to delete solar project');
    }
  }
}
