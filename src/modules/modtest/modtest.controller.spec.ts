import { Test, TestingModule } from '@nestjs/testing';
import { ModtestController } from './modtest.controller';
import { ModtestService } from './modtest.service';

describe('ModtestController', () => {
  let controller: ModtestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModtestController],
      providers: [ModtestService],
    }).compile();

    controller = module.get<ModtestController>(ModtestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
