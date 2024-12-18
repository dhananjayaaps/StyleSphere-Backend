import { Test, TestingModule } from '@nestjs/testing';
import { VebxrmodelController } from './vebxrmodel.controller';
import { VebxrmodelService } from './vebxrmodel.service';

describe('VebxrmodelController', () => {
  let controller: VebxrmodelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VebxrmodelController],
      providers: [VebxrmodelService],
    }).compile();

    controller = module.get<VebxrmodelController>(VebxrmodelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
