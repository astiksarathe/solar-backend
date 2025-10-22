import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerDataService } from './consumer-data.service';

describe('ConsumerDataService', () => {
  let service: ConsumerDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsumerDataService],
    }).compile();

    service = module.get<ConsumerDataService>(ConsumerDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
