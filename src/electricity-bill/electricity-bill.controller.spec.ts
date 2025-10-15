import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityBillController } from './electricity-bill.controller';
import { ElectricityBillService } from './electricity-bill.service';
import { HttpService } from '@nestjs/axios';

const mockHttpService = {
  get: jest.fn(),
};

describe('ElectricityBillController', () => {
  let controller: ElectricityBillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectricityBillController],
      providers: [
        ElectricityBillService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    controller = module.get<ElectricityBillController>(
      ElectricityBillController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
