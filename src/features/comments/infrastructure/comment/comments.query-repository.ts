import { Injectable } from '@nestjs/common';
import { InternalCode, LikeStatusEnum } from '../../../../shared/enums';
import { ViewCommentModel } from '../../api/models/view/ViewCommentModel';
import { QueryParamsCommentModel } from '../../api/models/input/QueryParamsCommentModel';
import { QueryBuildDTO, ResultDTO } from '../../../../shared/dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Comment } from '../../entities/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async findComments(
    postId: string,
    query: QueryParamsCommentModel,
    userId?: number,
  ): Promise<ResultDTO<QueryBuildDTO<Comment, ViewCommentModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const builder = await this.commentRepo
      .createQueryBuilder('c')
      .orderBy(`c.${sortBy}`, sortDirection as 'ASC' | 'DESC')
      .select(['c."id"', 'c."content"', 'c."createdAt"'])
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'likesCount')
          .from('comment_likes', 'l')
          .where({ status: LikeStatusEnum.Like })
          .andWhere('c.id = l."commentId"');
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'dislikesCount')
          .from('comment_likes', 'l')
          .where({ status: LikeStatusEnum.Dislike })
          .andWhere('c.id = l."commentId"');
      })
      .addSelect((qb) => {
        return qb
          .select('l."status"', 'myStatus')
          .from('comment_likes', 'l')
          .where({ userId })
          .andWhere('c.id = l."commentId"');
      })
      .leftJoinAndSelect(
        (qb) =>
          qb
            .select('u.id AS "userId", u.login AS "userLogin"')
            .from('users', 'u'),
        'u',
        'u."userId" = c."userId"',
      )
      .where('c."postId" = :postId', { postId });

    const comments = await builder.offset(offset).limit(pageSize).getRawMany();
    const totalCount = await builder.getCount();
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      comments,
    );

    data.map(this._mapCommentToView);
    return new ResultDTO(InternalCode.Success, data);
  }

  async findCommentById(
    commentId: number,
    userId?: string,
  ): Promise<ResultDTO<ViewCommentModel>> {
    const comment = await this.commentRepo
      .createQueryBuilder('c')
      .select(['c."id"', 'c."content"', 'c."createdAt"'])
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'likesCount')
          .from('comment_likes', 'l')
          .where({ commentId, status: LikeStatusEnum.Like });
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'dislikesCount')
          .from('comment_likes', 'l')
          .where({ commentId, status: LikeStatusEnum.Dislike });
      })
      .leftJoinAndSelect(
        (qb) =>
          qb
            .select('u.id AS "userId", u.login AS "userLogin"')
            .from('users', 'u'),
        'u',
        'u = u',
      )
      .addSelect((qb) => {
        return qb
          .select('l."status"', 'myStatus')
          .from('comment_likes', 'l')
          .where({ userId })
          .andWhere('c.id = l."commentId"');
      })
      .where('c.id = :commentId', { commentId })
      .getRawOne();

    if (!comment) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapCommentToView(comment));
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
    'id', CAST(td."postId" AS TEXT),
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
      createdAt: new Date(comment.createdAt).toISOString(),
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: comment.likesInfo.myStatus ?? LikeStatusEnum.None,
      },
      postInfo: {
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
        title: comment.postInfo.title,
        id: comment.postInfo.id,
      },
    }));

    return new ResultDTO(InternalCode.Success, data);
  }

  _mapCommentToView(comment: any): ViewCommentModel {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      createdAt: new Date(comment.createdAt).toISOString(),
      likesInfo: {
        likesCount: +comment?.likesCount,
        dislikesCount: +comment?.dislikesCount,
        myStatus:
          comment?.myStatus ??
          comment?.likesInfo?.myStatus ??
          LikeStatusEnum.None,
      },
    };
  }
}
