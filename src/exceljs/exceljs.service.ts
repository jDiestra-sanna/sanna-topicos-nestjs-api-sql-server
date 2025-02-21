import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export default class ExcelJSService {
  private workbook: any;
  private worksheet: any;

  constructor() {
    this.createWorkbook();
  }

  private createWorkbook() {
    this.workbook = new ExcelJS.Workbook();
  }

  setWorksheetName(name: string) {
    this.worksheet = this.workbook.addWorksheet(name);
    return this;
  }

  setColumns(columns: object[]) {
    this.worksheet.columns = columns;
    return this;
  }

  setData(data: object[]) {
    data.forEach(o => this.worksheet.addRow(o));
    return this;
  }

  async writeBuffer() {
    const buffer = await this.workbook.xlsx.writeBuffer();
    this.createWorkbook();
    return buffer;
  }
}
