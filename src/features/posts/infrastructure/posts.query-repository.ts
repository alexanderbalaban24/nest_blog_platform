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
    SELECT * FROM "temp_data1" AS td
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
    SELECT p.*, b."name" AS "blogName", bb."isBanned",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" = '${LikeStatusEnum.Like}'
     AND pl."postId" = $1
     ) AS "likesCount",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" = '${LikeStatusEnum.Dislike}'
     AND pl."postId" = $1
     ) AS "dislikesCount",
     (SELECT lse."status"
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" != '${LikeStatusEnum.None}' AND
     pl."userId" = $2 AND pl."postId" = $1
     ) AS "myStatus",
     (SELECT array_agg(
     json_build_object(
     'addedAt', pl."addedAt",
     'userId', CAST(pl."userId" AS TEXT),
     'login', u."login"
     )
     )
     FROM (SELECT * 
     FROM "posts_likes" AS pl
     WHERE pl."postId" = $1
     ORDER BY pl."addedAt" DESC
     LIMIT 3
     ) AS pl
     LEFT JOIN "users" AS u
     ON u."id" = pl."userId"
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" = '${LikeStatusEnum.Like}'
     ) AS "newestLikes"
    FROM "posts" AS p
    LEFT JOIN "blogs" AS b
    ON p."blogId" = b."id"
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = p."blogId"
    WHERE (bb."isBanned" != true OR bb."isBanned" IS NULL) AND p."id" = $1
    
    `,
      [postId, userId],
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
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.myStatus ?? LikeStatusEnum.None,
        newestLikes: post.newestLikes ?? [],
      },
    };
  }
}
