import { Test, TestingModule } from '@nestjs/testing';
import { ModeratorManageController } from './moderator-manage.controller';

describe('ModeratorManageController', () => {
  let controller: ModeratorManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeratorManageController],
    }).compile();

    controller = module.get<ModeratorManageController>(ModeratorManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
