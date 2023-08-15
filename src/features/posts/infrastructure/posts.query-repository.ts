import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/posts.entity';
import { ViewPostModel } from '../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { UserLikeType } from '../../../shared/types';
import { Types } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
    userId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Post, ViewPostModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const postsRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (
    SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", b."name" AS "blogName", p."createdAt"
    FROM "posts" AS p
    LEFT JOIN "blogs" AS b
    ON b."id" = p."blogId"
    WHERE p."blogId" = CASE 
    WHEN $1 = 'undefined' THEN p."blogId" ELSE $1::integer END
    ),
    "temp_data2" AS (
    SELECT * FROM "temp_data1" as td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT (
    SELECT COUNT(*)
    FROM temp_data1
    ) AS "totalCount",
    (SELECT json_agg(
    json_build_object(
    'id', td."id", 'title', td."title", 'shortDescription', td."shortDescription", 'content', td."content", 'blogId', td."blogId", 'blogName', td."blogName", 'createdAt', td."createdAt"
    ) 
    ) FROM "temp_data2" AS td
    
    ) AS "data"
    `,
      [`${blogId}`],
    );

    const totalCount = +postsRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      postsRaw[0].data ?? [],
    );

    data.map((user) => this._mapPostToView(user));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<ResultDTO<ViewPostModel>> {
    const postsRaw = await this.dataSource.query(
      `
    SELECT *, b."name" AS "blogName"
    FROM "posts" AS p
    LEFT JOIN "blogs" AS b
    ON p."blogId" = b."id"
    WHERE p."id" = $1
    `,
      [postId],
    );

    if (!postsRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapPostToView(postsRaw[0]),
    );
  }

  _mapPostToView(post): ViewPostModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: new Date(post.createdAt).toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
    };
  }
}
