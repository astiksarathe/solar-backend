import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerDataController } from './consumer-data.controller';
import { ConsumerDataService } from './consumer-data.service';

describe('ConsumerDataController', () => {
  let controller: ConsumerDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerDataController],
      providers: [ConsumerDataService],
    }).compile();

    controller = module.get<ConsumerDataController>(ConsumerDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
