import { Test, TestingModule } from '@nestjs/testing';
import { ModeratorManageService } from './moderator-manage.service';

describe('ModeratorManageService', () => {
  let service: ModeratorManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeratorManageService],
    }).compile();

    service = module.get<ModeratorManageService>(ModeratorManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
