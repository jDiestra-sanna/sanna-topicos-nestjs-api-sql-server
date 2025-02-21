import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModtestService } from './modtest.service';
import { CreateModtestDto } from './dto/create-modtest.dto';
import { UpdateModtestDto } from './dto/update-modtest.dto';

@Controller('modtest')
export class ModtestController {
  constructor(private readonly modtestService: ModtestService) {}

  @Post()
  create(@Body() createModtestDto: CreateModtestDto) {
    return this.modtestService.create(createModtestDto);
  }

  @Get()
  findAll() {
    return this.modtestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modtestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModtestDto: UpdateModtestDto) {
    return this.modtestService.update(+id, updateModtestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modtestService.remove(+id);
  }
}
