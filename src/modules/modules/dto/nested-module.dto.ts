import { Module } from '../entities/module.entity';

export class NestedModuleDto extends Module {
  children: NestedModuleDto[] = [];
  type: string = '';
}
