export class RspDto {
  statusCode: number;
  data: any;
  message: string;
}

export class PaginatedDto extends RspDto {
  total: number
  limit: number
  page: number
}