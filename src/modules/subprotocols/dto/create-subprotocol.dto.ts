import { IsInt, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSubProtocolDto {
  @IsString({message: 'Título de subprotocolo debe ser texto'})
  @MaxLength(100, {message: 'Título de subprotocolo debe tener como máximo 100 caracteres'})
  @MinLength(1, {message: 'Ingrese un título'})
  title: string

  @IsString({ message: 'Descripción de subprotocolo debe ser texto' })
  @MinLength(1, { message: 'Ingrese una descripción' })
  @MaxLength(1500, { message: 'Descripcion máximo 1500 caracteres' })
  description: string;

  protocol_id: number
}