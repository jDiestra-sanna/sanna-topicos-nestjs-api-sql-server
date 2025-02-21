import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { FormFactorsService } from "src/modules/form-factor/form-factor.service";

@Injectable()
@ValidatorConstraint({name: 'FormFactorExists', async: true})
export class FormFactorExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly formFactorService: FormFactorsService) {}

    async validate(id: number): Promise<boolean> {
        const exists = await this.formFactorService.formFactorExists(id);
        return exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'No existe esta presentacion';
    }
}