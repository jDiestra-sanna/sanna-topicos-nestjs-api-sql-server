import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MedicineService } from "../medicines.service";

@Injectable()
@ValidatorConstraint({name: 'MedicineExists', async: true})
export class MedicineExistsByCodeRule implements ValidatorConstraintInterface {
    constructor(private readonly medicineService: MedicineService) {}

    async validate(code: string): Promise<boolean> {
        const exists = await this.medicineService.medicineExistsByCode(code);
        return !exists
    }

    defaultMessage(args: ValidationArguments) {
        return 'Ya existe este codigo';
    }
}