import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleGroups } from "./entities/article-groups.entity";
import { ArticleGroupsService } from "./article-groups.service";
import { ArticleGroupsController } from "./article-groups.controller";
import { Medicine } from "../medicines/entities/medicines.entity";
import { ArticleGroupNameExistsRule } from "./validators/article-group-name.validator";
import { ArticleGroupExistsRule } from "./decorators/article-group-exists.decorator";

@Module({
    imports: [TypeOrmModule.forFeature([ArticleGroups, Medicine])],
    controllers: [ArticleGroupsController],
    providers: [ArticleGroupsService, ArticleGroupNameExistsRule, ArticleGroupExistsRule],
    exports: [ArticleGroupsService]
})

export class ArticleGroupsModule {}