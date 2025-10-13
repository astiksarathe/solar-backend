import { Test, TestingModule } from '@nestjs/testing';
import { EmiCalculatorController } from './emi-calculator.controller';
import { EmiCalculatorService } from './emi-calculator.service';

describe('EmiCalculatorController', () => {
  let controller: EmiCalculatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmiCalculatorController],
      providers: [EmiCalculatorService],
    }).compile();

    controller = module.get<EmiCalculatorController>(EmiCalculatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
