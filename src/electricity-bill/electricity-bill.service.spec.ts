import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityBillService } from './electricity-bill.service';

describe('ElectricityBillService', () => {
  let service: ElectricityBillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElectricityBillService],
    }).compile();

    service = module.get<ElectricityBillService>(ElectricityBillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
