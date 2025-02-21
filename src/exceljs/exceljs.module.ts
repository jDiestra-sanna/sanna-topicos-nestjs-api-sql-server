import { Module } from '@nestjs/common';
import ExcelJSService from './exceljs.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ExcelJSService],
  exports: [ExcelJSService],
})
export default class ExcelJS {}
