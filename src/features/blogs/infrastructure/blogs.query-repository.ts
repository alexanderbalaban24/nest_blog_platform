import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blogs.entity';
import { ViewBlogModel } from '../api/models/view/ViewBlogModel';
import { QueryParamsBlogModel } from '../api/models/input/QueryParamsBlogModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { Types } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findBlogs(
    query: QueryParamsBlogModel,
    bloggerId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Blog, ViewBlogModel>>> {
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
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchNameTerm = `%${query.searchNameTerm ?? ''}%`;

    const blogsRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (
    SELECT b.*, bb."isBanned", bb."banDate", u."id" AS "userId", u."login" AS "userLogin" 
    FROM "blogs" AS b
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = b."id"
    LEFT JOIN "users" AS u
    ON u."id" = b."ownerId"
    WHERE b."name" ILIKE $1
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
    'id', td."id", 'name', td."name", 'description', td."description", 'websiteUrl', td."websiteUrl", 'createdAt', td."createdAt", 'isMembership', td."isMembership", 'blogOwnerInfo',
    json_build_object(
    'userId', td."userId", 'userLogin', td."userLogin"
    ), 'banInfo',
    json_build_object(
    'isBanned', td."isBanned",
    'banDate', td."banDate"
    )
    )
    ) FROM "temp_data2" AS td
    ) AS "data"
    `,
      [searchNameTerm],
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

    data.map((user) => this._mapBlogToView(user, true));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findBlogById(
    blogId: string,
    internalCall?: boolean,
  ): Promise<ResultDTO<ViewBlogModel>> {
    const blogsRaw = await this.dataSource.query(
      `
   WITH "temp_data1" AS (
    SELECT b.*, bb."isBanned", bb."banDate", u."id" AS "userId", u."login" AS "userLogin" 
    FROM "blogs" AS b
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = b."id"
    LEFT JOIN "users" AS u
    ON u."id" = b."ownerId"
    WHERE b."id" = $1 AND
    bb."isBanned" = false
    )
    SELECT (SELECT json_agg(
    json_build_object(
    'id', td."id", 'name', td."name", 'description', td."description", 'websiteUrl', td."websiteUrl", 'createdAt', td."createdAt", 'isMembership', td."isMembership", 'blogOwnerInfo',
    json_build_object(
    'userId', td."userId", 'userLogin', td."userLogin"
    ), 'banInfo',
    json_build_object(
    'isBanned', td."isBanned",
    'banDate', td."banDate"
    )
    )
    ) FROM "temp_data1" AS td
    ) AS "data"
    `,
      [blogId],
    );

    if (!blogsRaw[0].data) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapBlogToView(blogsRaw[0].data[0], internalCall),
    );
  }

  _mapBlogToView(blog, isSuperAdmin?: boolean): ViewBlogModel {
    const result = {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(blog.createdAt).toISOString(),
      isMembership: blog.isMembership,
    };

    if (isSuperAdmin) {
      return {
        ...result,
        blogOwnerInfo: {
          userId: blog.blogOwnerInfo.toString(),
          userLogin: blog.blogOwnerInfo.userLogin,
        },
        banInfo: {
          isBanned: blog.banInfo.isBanned,
          banDate: new Date(blog.banInfo.banDate).toISOString(),
        },
      };
    }

    return result;
  }
}
