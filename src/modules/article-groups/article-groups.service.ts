import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleGroups } from './entities/article-groups.entity';
import { Repository } from 'typeorm';
import { CreateArticleGroupDto } from './dto/create-article-group.dto';
import { UpdateArticleGroupDto } from './dto/update-article-group.dto';
import { getSystemDatetime } from 'src/common/helpers/date';
import { BaseEntityState } from 'src/common/entities/base.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReqQuery } from './dto/req-query.dto';

@Injectable()
export class ArticleGroupsService {
  constructor(@InjectRepository(ArticleGroups) private articleGroupsRepository: Repository<ArticleGroups>) {}

  async findAll(req_query: ReqQuery): Promise<PaginatedResult<ArticleGroups>> {
    const skip = req_query.limit * req_query.page;
    let qb = this.articleGroupsRepository.createQueryBuilder('article_group');

    qb.where('article_group.state != :state', { state: BaseEntityState.DELETED });

    if (req_query.query) {
      qb.andWhere('CONCAT(article_group.name) LIKE :pattern', {
        pattern: `%${req_query.query}%`,
      });
    }

    if (req_query.date_from && req_query.date_to) {
      qb.andWhere('CAST(article_group.date_created AS DATE) BETWEEN :date_from AND :date_to', {
        date_from: req_query.date_from,
        date_to: req_query.date_to,
      });
    }

    const total = await qb.getCount();
    qb.skip(skip);
    qb.take(req_query.limit);
    qb.orderBy(req_query.order_col, req_query.order_dir);

    const items = await qb.getMany();

    return {
      total,
      items,
      limit: req_query.limit,
      page: req_query.page,
    };

    // return await this.articleGroupsRepository.find()
  }

  async findOne(id: number) {
    const articleGroup = await this.articleGroupsRepository.findOneBy({ id });
    if (!articleGroup) return null;
    return articleGroup;
  }

  async create(createArticleGroup: CreateArticleGroupDto) {
    const newArticleGroup = await this.articleGroupsRepository.save({ ...createArticleGroup });
    return newArticleGroup.id;
  }

  async update(id: number, updateArticleGroup: UpdateArticleGroupDto) {
    const articleGroup = await this.articleGroupsRepository.findOneBy({ id });
    if (!articleGroup) return;
    articleGroup.date_updated = getSystemDatetime();

    const updatedArticleGroup = Object.assign(articleGroup, updateArticleGroup);
    await this.articleGroupsRepository.save(updatedArticleGroup);
  }

  async remove(id: number, forever: boolean = false) {
    const articleGroup = await this.articleGroupsRepository.findOneBy({ id });
    if (!articleGroup) return;

    if (forever) {
      await this.articleGroupsRepository.delete(id);
    } else {
      articleGroup.state = BaseEntityState.DELETED;
      articleGroup.date_deleted = getSystemDatetime();
      await this.articleGroupsRepository.save(articleGroup);
    }
  }

  async enable(id: number) {
    const articleGroup = await this.articleGroupsRepository.findOneBy({ id });

    if (!articleGroup) return;

    articleGroup.state = BaseEntityState.ENABLED;
    articleGroup.date_updated = getSystemDatetime();

    await this.articleGroupsRepository.save(articleGroup);
  }

  async disable(id: number) {
    const articleGroup = await this.articleGroupsRepository.findOneBy({ id });

    if (!articleGroup) return;

    articleGroup.state = BaseEntityState.DISABLED;
    articleGroup.date_updated = getSystemDatetime();

    await this.articleGroupsRepository.save(articleGroup);
  }

  async articleGroupExists(id: number): Promise<boolean> {
    return await this.articleGroupsRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .andWhere('state != :state', { state: BaseEntityState.DELETED })
      .getExists();
  }

  async existsArticleGroupName(name: string): Promise<boolean> {
    let qb = this.articleGroupsRepository.createQueryBuilder('ag');
    qb.where('ag.name = :name', { name });
    qb.andWhere('ag.state != :state', { state: BaseEntityState.DELETED });

    const count = await qb.getCount();
    return count > 0;
  }
}
