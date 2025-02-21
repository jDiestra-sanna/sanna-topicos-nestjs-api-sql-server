import { PartialType } from '@nestjs/swagger';
import { CreateModtestDto } from './create-modtest.dto';

export class UpdateModtestDto extends PartialType(CreateModtestDto) {}
