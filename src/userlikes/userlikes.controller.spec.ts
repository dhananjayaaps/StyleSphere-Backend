import { Test, TestingModule } from '@nestjs/testing';
import { UserLikesController } from './userlikes.controller';
import { UserLikesService } from './userlikes.service';

describe('UserlikesController', () => {
  let controller: UserLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLikesController],
      providers: [UserLikesService],
    }).compile();

    controller = module.get<UserLikesController>(UserLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
