import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { FormFactorsService } from "../form-factor.service";


@Injectable()
@ValidatorConstraint({name: 'FormFactorNameExists', async: true})
export class FormFactorNameExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly formFactorService: FormFactorsService){}

    async validate(name: string): Promise<boolean> {
        const exists = await this.formFactorService.existsFormFactorName(name)
        return !exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'Ya existe una presentacion con ese nombre'
    }
}