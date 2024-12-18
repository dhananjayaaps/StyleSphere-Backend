import { Test, TestingModule } from '@nestjs/testing';
import { VebxrmodelService } from './vebxrmodel.service';

describe('VebxrmodelService', () => {
  let service: VebxrmodelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VebxrmodelService],
    }).compile();

    service = module.get<VebxrmodelService>(VebxrmodelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
