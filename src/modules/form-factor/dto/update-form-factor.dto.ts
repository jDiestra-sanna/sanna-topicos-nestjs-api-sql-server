import { IsString, Validate } from "class-validator";
import { FormFactorNameExistsRule } from "../validator/form-factor-name.validator";

export class UpdateFormFactorDto {
    @IsString({ message: 'Nombre de presentacion debe ser texto'})
    @Validate(FormFactorNameExistsRule)
    name: string
}