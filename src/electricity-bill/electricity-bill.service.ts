import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import https from 'https';
import {
  MPCZBill,
  MPCZResponse,
  SolarRecommendation,
  MPCZError,
} from './electricity-bill.interface';

@Injectable()
export class ElectricityBillService {
  private readonly logger = new Logger(ElectricityBillService.name);

  constructor(private readonly httpService: HttpService) {}

  async getBillHistory(consumerNumber: string): Promise<SolarRecommendation> {
    try {
      let response: AxiosResponse<MPCZResponse>;

      try {
        response = await firstValueFrom(
          this.httpService.get<MPCZResponse>(
            `https://services.mpcz.in/serviceportal/api/payment/mGetBillMonth?&idNumber=${consumerNumber}`,
            {
              httpsAgent: new https.Agent({
                rejectUnauthorized: false, // ignore invalid/self-signed certificates
              }),
            },
          ),
        );
      } catch (err: unknown) {
        let message = 'Unknown error';
        if (err instanceof AxiosError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        this.logger.error('HTTP request failed:', message);
        throw new MPCZError(
          'Failed to fetch bill data from MPCZ',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Validate response
      if (
        !response.data ||
        response.data.code !== '200' ||
        !response.data.list ||
        response.data.list.length === 0
      ) {
        throw new MPCZError(
          'No bill data found or invalid consumer number',
          HttpStatus.NOT_FOUND,
        );
      }

      return this.analyzeBillsAndCalculateSolar(response.data.list);
    } catch (error: unknown) {
      this.logger.error('Error in getBillHistory:', error);

      if (error instanceof MPCZError) {
        throw error;
      }

      throw new MPCZError(
        'An error occurred while processing your request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private analyzeBillsAndCalculateSolar(
    bills: MPCZBill[],
  ): SolarRecommendation {
    try {
      const last6MonthsBills = bills.slice(0, 6);

      const validBills = last6MonthsBills.filter((bill) => {
        const consumption = parseFloat(bill.consumption);
        const amount = parseFloat(bill.amount);
        if (isNaN(consumption) || isNaN(amount)) {
          throw new MPCZError(
            'Invalid bill data: consumption or amount is not a number',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        return consumption > 0 && amount > 0;
      });

      if (validBills.length === 0) {
        throw new MPCZError(
          'No valid bills found for analysis',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const totalConsumption = validBills.reduce(
        (sum, bill) => sum + parseFloat(bill.consumption),
        0,
      );
      const totalAmount = validBills.reduce(
        (sum, bill) => sum + parseFloat(bill.amount),
        0,
      );

      const averageConsumption = totalConsumption / validBills.length;
      const averageBill = totalAmount / validBills.length;

      if (averageConsumption === 0 || averageBill === 0) {
        throw new MPCZError(
          'Cannot calculate solar system: Zero consumption or bill amount',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Solar sizing calculation
      const peakSunHours = 4.5;
      const systemEfficiency = 0.8;
      const daysInMonth = 30;

      const dailyRequirement = averageConsumption / daysInMonth;
      const requiredSystemSize =
        dailyRequirement / (peakSunHours * systemEfficiency);
      const recommendedSystemSize = this.getRecommendedSystemSize(
        requiredSystemSize * 1.2,
      );

      const firstBill = bills[0];
      if (!firstBill) {
        throw new MPCZError(
          'Cannot process consumer details: No bill data available',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const consumerDetails = {
        name: firstBill.consumerName,
        consumerNo: firstBill.consumerNo,
        address:
          `${firstBill.address1}, ${firstBill.address2}, ${firstBill.address3}`
            .replace(/,\s*,/g, ',')
            .trim(),
        mobile: firstBill.mobile,
        purpose: firstBill.purpose,
      };

      // Calculate savings
      const monthlyBillSavings = averageBill * 0.9;
      const annualSavings = monthlyBillSavings * 12;
      const systemCost = recommendedSystemSize * 60000; // ₹60,000 per kW
      const paybackPeriod = systemCost / annualSavings;

      return {
        consumerDetails,
        billAnalysis: {
          totalBills: bills.length,
          last6MonthsData: last6MonthsBills,
          averageConsumption: Math.round(averageConsumption),
          averageBill: Math.round(averageBill),
          totalConsumption: Math.round(totalConsumption),
          totalAmount: Math.round(totalAmount),
        },
        solarRecommendation: {
          dailyRequirement: Math.round(dailyRequirement * 100) / 100,
          requiredSystemSize: Math.round(requiredSystemSize * 100) / 100,
          recommendedSystemSize,
          reasonForRecommendation: `Based on your average consumption of ${Math.round(
            averageConsumption,
          )} units/month, we recommend a ${recommendedSystemSize}kW system (includes 20% extra capacity for cloudy/monsoon seasons)`,
          savings: {
            monthlyBillSavings: Math.round(monthlyBillSavings),
            annualSavings: Math.round(annualSavings),
            paybackPeriod: Math.round(paybackPeriod * 10) / 10,
          },
        },
      };
    } catch (error: unknown) {
      this.logger.error('Error in analyzeBillsAndCalculateSolar:', error);

      if (error instanceof MPCZError) {
        throw error;
      }

      throw new MPCZError(
        'Failed to analyze bill data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getRecommendedSystemSize(calculatedSize: number): number {
    const standardSizes = [1, 2, 3, 5, 6, 10, 15, 20, 25, 30, 50, 100];
    for (const size of standardSizes) {
      if (size >= calculatedSize) {
        return size;
      }
    }
    return Math.ceil(calculatedSize / 5) * 5;
  }
}
