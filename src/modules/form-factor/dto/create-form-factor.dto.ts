import { IsString, Validate } from "class-validator";
import { FormFactorNameExistsRule } from "../validator/form-factor-name.validator";

export class CreateFormFactorDto {
    @IsString({ message: 'Nombre de presentacion debe ser texto'})
    @Validate(FormFactorNameExistsRule)
    name: string
}