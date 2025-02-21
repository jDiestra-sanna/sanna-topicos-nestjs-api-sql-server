import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { DiagnosesService } from "../diagnoses.service";

@Injectable()
@ValidatorConstraint({name: 'DiagnosisExists', async: true})
export class DiagnosisByCodeExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly diagnosesService: DiagnosesService) {}

    async validate(code: string): Promise<boolean> {
        const exists = await this.diagnosesService.diagnosisExistsByCode(code)
        return !exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'Ya existe el código de diagnostico'
    }
}