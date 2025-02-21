import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FormFactor } from "./entities/form-factor.entity";
import { FormFactorsService } from "./form-factor.service";
import { FormFactorController } from "./form-factor.controller";
import { Medicine } from "../medicines/entities/medicines.entity";
import { FormFactorNameExistsRule } from "./validator/form-factor-name.validator";
import { FormFactorExistsRule } from "./decorators/form-factor-exists.decorator";

@Module({
    imports: [TypeOrmModule.forFeature([FormFactor, Medicine])],
    controllers: [FormFactorController],
    providers: [FormFactorsService, FormFactorNameExistsRule, FormFactorExistsRule],
    exports: [FormFactorsService]
})

export class FormFactorModule {}