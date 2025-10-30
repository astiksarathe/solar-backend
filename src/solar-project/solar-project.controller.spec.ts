import { Test, TestingModule } from '@nestjs/testing';
import { SolarProjectController } from './solar-project.controller';
import { SolarProjectService } from './solar-project.service';

describe('SolarProjectController', () => {
  let controller: SolarProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolarProjectController],
      providers: [SolarProjectService],
    }).compile();

    controller = module.get<SolarProjectController>(SolarProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
