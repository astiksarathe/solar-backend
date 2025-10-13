import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityBillController } from './electricity-bill.controller';
import { ElectricityBillService } from './electricity-bill.service';

describe('ElectricityBillController', () => {
  let controller: ElectricityBillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectricityBillController],
      providers: [ElectricityBillService],
    }).compile();

    controller = module.get<ElectricityBillController>(ElectricityBillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
