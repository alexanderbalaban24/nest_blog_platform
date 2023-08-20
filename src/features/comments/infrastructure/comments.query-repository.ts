import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { ViewCommentModel } from '../api/models/view/ViewCommentModel';
import { QueryParamsCommentModel } from '../api/models/input/QueryParamsCommentModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findComments(
    postId: string,
    query: QueryParamsCommentModel,
    userId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Comment, ViewCommentModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const commentsRaw = await this.dataSource.query(
      `
     WITH "temp_data1" AS (SELECT pc."id", pc."content", u."id" AS "userId", u."login" AS "userLogin", pc."createdAt", p."id" AS "postId", p."title", p."blogId", b."name" AS "blogName",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Like}'
     AND pcl."commentId" = pc."id" AND ub."isBanned" != true
     ) AS "likesCount",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Dislike}'
     AND pcl."commentId" = pc."id" AND ub."isBanned" != true
     ) AS "dislikesCount",
     (SELECT lse."status"
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     WHERE lse."status" != '${LikeStatusEnum.None}' AND
     pcl."userId" = $1 AND pcl."commentId" = pc."id"
     ) AS "myStatus"
    FROM "posts_comments" AS pc
    LEFT JOIN "users" AS u
    ON u."id" = pc."commentatorId"
    LEFT JOIN "posts" AS p
    ON p."id" = pc."postId"
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = p."blogId"
    LEFT JOIN "blogs" AS b
    ON b."id" = p."blogId"
    LEFT JOIN "users_ban" AS ub
    ON ub."userId" = pc."commentatorId"
    WHERE pc."postId" = $2 AND 
    (bb."isBanned" != true OR bb."isBanned" IS NULL) AND ub."isBanned" != true
    ),
    "temp_data2" as (
    SELECT * FROM "temp_data1" as td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT (
    SELECT COUNT(*)
    FROM "temp_data1"
    ) as "totalCount",
    (SELECT json_agg(
    json_build_object(
    'id', td."id", 'content', td."content", 'createdAt', td."createdAt", 'commentatorInfo',
    json_build_object(
    'userId', CAST(td."userId" AS TEXT), 'userLogin', td."userLogin"
    ), 'likesInfo',
    json_build_object(
    'likesCount', td."likesCount",
    'dislikesCount', td."dislikesCount",
    'myStatus', td."myStatus"
    )
    )
    ) FROM "temp_data2" AS td
    ) AS "data"
    `,
      [userId, postId],
    );

    const totalCount = +commentsRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      commentsRaw[0].data ?? [],
    );

    data.map(this._mapCommentToView);

    return new ResultDTO(InternalCode.Success, data);
  }

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<ResultDTO<any>> {
    const commentRaw = await this.dataSource.query(
      `
    SELECT pc."id", pc."content", CAST(u."id" AS TEXT) AS "userId", u."login" AS "userLogin", pc."createdAt", 
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE pcl."commentId" = $1 AND
     lse."status" = '${LikeStatusEnum.Like}' AND ub."isBanned" != true
     ) AS "likesCount",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE pcl."commentId" = $1 AND
     lse."status" = '${LikeStatusEnum.Dislike}' AND ub."isBanned" != true
     ) AS "dislikesCount",
     (SELECT lse."status"
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     WHERE pcl."commentId" = $1 AND
     lse."status" != '${LikeStatusEnum.None}' AND
     pcl."userId" = $2 AND pcl."commentId" = $1
     ) AS "myStatus"
    FROM "posts_comments" AS pc
    LEFT JOIN "users" AS u
    ON u."id" = pc."commentatorId"
    LEFT JOIN "posts" AS p
    ON p."id" = pc."postId"
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = p."blogId"
    LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pc."commentatorId"
    WHERE pc."id" = $1 AND
    (bb."isBanned" != true OR bb."isBanned" IS NULL) AND u."isBanned" != true
    `,
      [commentId, userId],
    );

    if (!commentRaw.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapCommentToView(commentRaw[0]),
    );
  }

  async getCommentsForAllPostsForAllUserBlogs(
    query: QueryParamsCommentModel,
    userId: string,
  ): Promise<ResultDTO<QueryBuildDTO<any, any>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const commentsRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (SELECT pc."id", pc."content", u."id" AS "userId", u."login" AS "userLogin", pc."createdAt", p."id" AS "postId", p."title", p."blogId", b."name" AS "blogName",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Like}' AND ub."isBanned" != true
     AND pcl."commentId" = pc."id"
     ) AS "likesCount",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pcl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Dislike}' AND ub."isBanned" != true
     AND pcl."commentId" = pc."id"
     ) AS "dislikesCount",
     (SELECT lse."status"
     FROM "posts_comments_likes" AS pcl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pcl."status"
     WHERE lse."status" != '${LikeStatusEnum.None}' AND
     pcl."userId" = $1 AND pcl."commentId" = pc."id"
     ) AS "myStatus"
    FROM "posts_comments" AS pc
    LEFT JOIN "users" AS u
    ON u."id" = pc."commentatorId"
    LEFT JOIN "posts" AS p
    ON p."id" = pc."postId"
    LEFT JOIN "blogs_ban" AS bb
    ON bb."blogId" = p."blogId"
    LEFT JOIN "blogs" AS b
    ON b."id" = p."blogId"
    WHERE bb."isBanned" != true OR bb."isBanned" IS NULL
    ),
    "temp_data2" as (
    SELECT * FROM "temp_data1" as td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT (
    SELECT COUNT(*)
    FROM "temp_data1"
    ) as "totalCount",
    (SELECT json_agg(
    json_build_object(
    'id', td."id", 'content', td."content", 'createdAt', td."createdAt", 'commentatorInfo',
    json_build_object(
    'userId', CAST(td."userId" AS TEXT), 'userLogin', td."userLogin"
    ), 'likesInfo',
    json_build_object(
    'likesCount', td."likesCount",
    'dislikesCount', td."dislikesCount",
    'myStatus', td."myStatus"
    ), 'postInfo',
    json_build_object(
    'id', td."postId",
    'title', td."title",
    'blogId', CAST(td."blogId" AS TEXT),
    'blogName', td."blogName"
    )
    )
    ) FROM "temp_data2" AS td
    ) AS "data"
    `,
      [userId],
    );

    const totalCount = +commentsRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      commentsRaw[0].data ?? [],
    );
    console.log(commentsRaw[0]);
    data.map((comment) => ({
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: comment.likesInfo.myStatus ?? LikeStatusEnum.None,
      },
      postInfo: {
        id: comment.postInfo.postId,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    }));

    return new ResultDTO(InternalCode.Success, data);
  }

  _mapCommentToView(comment): ViewCommentModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment?.userId ?? comment?.commentatorInfo?.userId,
        userLogin: comment?.userLogin ?? comment?.commentatorInfo?.userLogin,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      likesInfo: {
        likesCount: comment?.likesCount ?? comment?.likesInfo?.likesCount,
        dislikesCount:
          comment?.dislikesCount ?? comment?.likesInfo?.dislikesCount,
        myStatus:
          comment?.myStatus ??
          comment?.likesInfo?.myStatus ??
          LikeStatusEnum.None,
      },
    };
  }

  async _queryBuilder(queryData, entity) {
    const sortBy = queryData.sortBy ?? 'createdAt';
    const sortDirection = queryData.sortDirection ?? 'desc';
    const pageNumber = queryData.pageNumber ? +queryData.pageNumber : 1;
    const pageSize = queryData.pageSize ? +queryData.pageSize : 10;
    const skip = pageSize * (pageNumber - 1);

    //TODO надо изменить подход, а то получается двойной запрос, у Глеба там пример есть, как погинацию вынести в агреггацию
    const forCount = await entity;

    entity
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);
    const pagesCount = Math.ceil(forCount.length / pageSize);

    const items = await entity;

    return new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      forCount.length,
      items,
    );
  }
}
