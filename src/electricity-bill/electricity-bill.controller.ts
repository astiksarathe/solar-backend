import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
  Header,
} from '@nestjs/common';
import { ElectricityBillService } from './electricity-bill.service';
import {
  APIResponse,
  SolarRecommendation,
  MPCZError,
  ErrorResponse,
} from './electricity-bill.interface';

@Controller('electricity-bill')
export class ElectricityBillController {
  private readonly logger = new Logger(ElectricityBillController.name);

  constructor(private readonly mpczBillsService: ElectricityBillService) {}

  @Get('analyze/:consumerNumber')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('X-Frame-Options', 'DENY')
  @Header('X-XSS-Protection', '1; mode=block')
  @Header('Referrer-Policy', 'no-referrer')
  @Header('Permissions-Policy', 'geolocation=()')
  async analyzeBills(
    @Param('consumerNumber') consumerNumber: string,
  ): Promise<APIResponse<SolarRecommendation>> {
    try {
      if (!consumerNumber?.trim()) {
        throw new MPCZError(
          'Consumer number is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.mpczBillsService.getBillHistory(
        consumerNumber.trim(),
      );

      return {
        success: true,
        data: result,
        message:
          'Bill analysis and solar recommendation completed successfully',
      };
    } catch (error: unknown) {
      this.logger.error('Error in bill analysis:', error);

      if (error instanceof MPCZError) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            error: error.message,
            code: error.code,
          } as ErrorResponse,
          error.status,
        );
      }

      // Handle unknown errors
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      throw new HttpException(
        {
          success: false,
          message: 'Failed to analyze bills',
          error: errorMessage,
        } as ErrorResponse,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
