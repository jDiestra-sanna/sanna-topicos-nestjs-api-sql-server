import { IsDateString, IsEnum, IsOptional, ValidateIf } from "class-validator";
import { BaseFindAllRequestQuery } from "src/common/dto/url-query.dto";

export enum OrderCol {
    ID = 'medcon.id',
    CAMPUS_NAME = 'ca.name',
    PROFESSIONAL_NAME = 'us.name',
    PATIENT_NAME = 'pat.name',
    CONSULTATION_TYPE_NAME = 'cty.name',
    MAIN_DIAGNOSIS_NAME = 'maidiag.name',
    MEDICINE_NAME = 'medi.name',
    ATTENDANCE_DATE = 'medcon.attendance_date',
  }

export class ReqQuery extends BaseFindAllRequestQuery {
    @IsOptional()
    @IsEnum(OrderCol)
    order_col: OrderCol | any = OrderCol.ID;

    @IsOptional()
    @IsDateString()
    @ValidateIf(o => o.date_from)
    date_from: string;
    
    @IsOptional()
    @IsDateString()
    @ValidateIf(o => o.date_to)
    date_to: string;

    user_id?: number
}
