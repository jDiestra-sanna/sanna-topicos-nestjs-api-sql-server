import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { ProffesionsService } from "src/modules/proffesions/proffesions.service";

@Injectable()
@ValidatorConstraint({name: 'ProffesionExists', async: true})
export class ProffesionExistsRule implements ValidatorConstraintInterface {
    constructor(private readonly proffesionService: ProffesionsService) {}

    async validate(id: number): Promise<boolean> {
        const exists = await this.proffesionService.proffesionExists(id)
        return exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'No existe esta profesion';
    }
}