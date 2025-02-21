import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { DiagnosisTypesService } from "../diagnosesType.service";

@Injectable()
@ValidatorConstraint({name: 'DiagnosisTypeExists', async: true})
export class DiagnosisTypeExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly diagnosisTypesService: DiagnosisTypesService) {}

    async validate(id: number): Promise<boolean> {
        const exists = await this.diagnosisTypesService.diagnosisTypeExists(id)
        return exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'No existe este diagnóstico';
    }
}