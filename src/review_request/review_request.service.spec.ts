import { Test, TestingModule } from '@nestjs/testing';
import { ReviewRequestService } from './review_request.service';

describe('ReviewRequestService', () => {
  let service: ReviewRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewRequestService],
    }).compile();

    service = module.get<ReviewRequestService>(ReviewRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
