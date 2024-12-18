import { Test, TestingModule } from '@nestjs/testing';
import { AidescribeService } from './aidescribe.service';

describe('AidescribeService', () => {
  let service: AidescribeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AidescribeService],
    }).compile();

    service = module.get<AidescribeService>(AidescribeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
