import { Module } from "@nestjs/common";
import { IllnessQuantityTypesService } from "./illness-quantity-types.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IllnessQuantityType } from "./entities/illness-quantity-type.entity";
import { IllnessQuantityTypeExistsRule } from "./decorators/illness-quantity-type-exists.decorator";

@Module({
  imports: [TypeOrmModule.forFeature([IllnessQuantityType])],
  controllers: [],
  providers: [IllnessQuantityTypesService, IllnessQuantityTypeExistsRule],
  exports: [IllnessQuantityTypesService]
})
export class IllnessQuantityTypesModule {}