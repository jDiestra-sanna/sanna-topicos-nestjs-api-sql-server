import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RspDto, PaginatedDto } from '../dto/http-response.dto';

export const rspOk = (res: Response, data: any = null, message: string = 'ok') => {
  const status = HttpStatus.OK;

  const rspDto = new RspDto();

  rspDto.message = message;
  rspDto.data = data;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};

export const rspOkUpdated = (res: Response) => {
  const status = HttpStatus.OK;

  const rspDto = new RspDto();

  rspDto.message = 'Actualizado correctamente';
  rspDto.data = null;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};

export const rspOkDeleted = (res: Response) => {
  const status = HttpStatus.OK;

  const rspDto = new RspDto();

  rspDto.message = 'Eliminado correctamente';
  rspDto.data = null;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};

export const paginatedRspOk = (
  res: Response,
  data: any,
  total: number,
  limit: number,
  page: number = 0,
) => {
  const status = HttpStatus.OK;

  const rspDto = new PaginatedDto();

  rspDto.message = 'ok';
  rspDto.data = data;
  rspDto.statusCode = status;
  rspDto.total = total;
  rspDto.limit = limit;
  rspDto.page = page;

  return res.status(status).json(rspDto);
};

export const rsp404 = (res: Response, message: string = 'No encontrado') => {
  const status = HttpStatus.NOT_FOUND;

  const rspDto = new RspDto();

  rspDto.message = message
  rspDto.data = null;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};

export const rsp204 = (res: Response) => {
  const status = HttpStatus.NO_CONTENT;

  const rspDto = new RspDto();

  rspDto.message = 'Eliminado correctamente';
  rspDto.data = null;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};

export const rsp201 = (res: Response, data: any) => {
  const status = HttpStatus.CREATED;

  const rspDto = new RspDto();

  rspDto.message = 'Creado correctamente';
  rspDto.data = data;
  rspDto.statusCode = status;

  return res.status(status).json(rspDto);
};
