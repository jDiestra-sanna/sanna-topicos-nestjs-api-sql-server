import { Module } from '@nestjs/common';
import { ModtestService } from './modtest.service';
import { ModtestController } from './modtest.controller';

@Module({
  controllers: [ModtestController],
  providers: [ModtestService],
})
export class ModtestModule {}
