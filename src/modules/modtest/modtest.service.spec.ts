import { Test, TestingModule } from '@nestjs/testing';
import { ModtestService } from './modtest.service';

describe('ModtestService', () => {
  let service: ModtestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModtestService],
    }).compile();

    service = module.get<ModtestService>(ModtestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
