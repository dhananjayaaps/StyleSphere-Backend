import { Test, TestingModule } from '@nestjs/testing';
import { AidescribeController } from './aidescribe.controller';
import { AidescribeService } from './aidescribe.service';

describe('AidescribeController', () => {
  let controller: AidescribeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidescribeController],
      providers: [AidescribeService],
    }).compile();

    controller = module.get<AidescribeController>(AidescribeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
