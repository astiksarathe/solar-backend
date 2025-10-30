import { Test, TestingModule } from '@nestjs/testing';
import { SolarProjectService } from './solar-project.service';

describe('SolarProjectService', () => {
  let service: SolarProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolarProjectService],
    }).compile();

    service = module.get<SolarProjectService>(SolarProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
