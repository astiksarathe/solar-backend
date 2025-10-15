import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityBillService } from './electricity-bill.service';
import { HttpService } from '@nestjs/axios';

const mockHttpService = {
  get: jest.fn(),
};

describe('ElectricityBillService', () => {
  let service: ElectricityBillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectricityBillService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<ElectricityBillService>(ElectricityBillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
