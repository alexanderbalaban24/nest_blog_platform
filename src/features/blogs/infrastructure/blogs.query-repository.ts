import { Injectable } from '@nestjs/common';
import { ViewBlogModel } from '../api/models/view/ViewBlogModel';
import { QueryParamsBlogModel } from '../api/models/input/QueryParamsBlogModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private blogsRepo: Repository<Blog>,
  ) {}

  async findBlogs(
    query: QueryParamsBlogModel,
    bloggerId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<any, ViewBlogModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchNameTerm = `%${query.searchNameTerm ?? ''}%`;

    const blogsRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (
    SELECT b.*, bb."isBanned" 
    FROM "blogs" AS b
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = b."id"
    WHERE bb."isBanned" = false AND
    b."ownerId" = (CASE 
    WHEN $1 = 'undefined' THEN b."ownerId" ELSE $1::integer END) AND
    b."name" ILIKE $2
    ),
    "temp_data2" AS (
    SELECT * FROM "temp_data1" AS td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT(
    SELECT COUNT(*)
    FROM "temp_data1"
    ) AS "totalCount",
    (
    SELECT json_agg(
    json_build_object(
    'id', td."id", 'name', td."name", 'description', td."description", 'websiteUrl', td."websiteUrl", 'createdAt', td."createdAt", 'isMembership', td."isMembership"
    )
    ) FROM "temp_data2" AS td
    ) AS "data"
    `,
      [`${bloggerId}`, searchNameTerm],
    );

    const totalCount = +blogsRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      blogsRaw[0].data ?? [],
    );

    data.map((user) => this._mapBlogToView(user));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findBlogsForSA(
    query: QueryParamsBlogModel,
  ): Promise<ResultDTO<QueryBuildDTO<Blog, ViewBlogModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchNameTerm = `%${query.searchNameTerm ?? ''}%`;

    const res = await this.blogsRepo
      .createQueryBuilder('b')
      .orderBy(`b.${sortBy}`, sortDirection as 'ASC' | 'DESC')
      .where('b.name ILIKE :searchNameTerm', { searchNameTerm })
      .offset(offset)
      .limit(pageSize)
      .getManyAndCount();

    const blogs = res[0];
    const totalCount = res[1];
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<Blog, ViewBlogModel>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      blogs,
    );

    data.map((user) => this._mapBlogToView(user));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findBlogById(blogId: number): Promise<ResultDTO<ViewBlogModel>> {
    const blog = await this.blogsRepo.findOneBy({ id: blogId });

    if (!blog) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapBlogToView(blog));
  }

  /*async findBlogsForSA(
    query: QueryParamsBlogModel,
  ): Promise<ResultDTO<QueryBuildDTO<any, ViewBlogModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchNameTerm = `%${query.searchNameTerm ?? ''}%`;

    const blogs = await this.blogsRepo.createQueryBuilder('b');

    const totalCount = +blogsRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      blogsRaw[0].data ?? [],
    );

    data.map((user) => this._mapBlogToView(user));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findBlogById(blogId: number): Promise<ResultDTO<ViewBlogModel>> {
    const blog = await this.blogsRepo.findOneBy({ id: blogId });

    if (!blog) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapBlogToView(blog));
  }*/

  _mapBlogToView(blog): ViewBlogModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
