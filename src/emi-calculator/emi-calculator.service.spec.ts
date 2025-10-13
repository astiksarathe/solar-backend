import { Test, TestingModule } from '@nestjs/testing';
import { EmiCalculatorService } from './emi-calculator.service';

describe('EmiCalculatorService', () => {
  let service: EmiCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmiCalculatorService],
    }).compile();

    service = module.get<EmiCalculatorService>(EmiCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
