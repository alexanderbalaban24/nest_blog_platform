import { Injectable } from '@nestjs/common';
import { ViewPostModel } from '../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Post, ViewPostModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const res = await this.postsRepo
      .createQueryBuilder('p')
      .orderBy(
        sortBy !== 'blogName' ? `p.${sortBy}` : 'b.name',
        sortDirection as 'ASC' | 'DESC',
      )
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.createdAt',
        'p.blogId',
        'b.name',
      ])
      .leftJoin('p.blog', 'b')
      .where(blogId ? 'b.id = :blogId' : 'b.id = b.id', { blogId })
      .offset(offset)
      .limit(pageSize)
      .getManyAndCount();

    const posts = res[0];
    const totalCount = res[1];
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<Post, ViewPostModel>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      posts,
    );

    data.map((post) => this._mapPostToView(post));
    return new ResultDTO(InternalCode.Success, data);
  }

  /*async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<any, ViewPostModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const postsRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (
    SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", b."name" AS "blogName", p."createdAt",
    (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Like}' AND ub."isBanned" != true
     AND pl."postId" = p."id"
     ) AS "likesCount",
     (SELECT CAST(COUNT(*) AS INTEGER)
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = pl."userId"
     WHERE lse."status" = '${LikeStatusEnum.Dislike}' AND ub."isBanned" != true
     AND pl."postId" = p."id"
     ) AS "dislikesCount",
     (SELECT lse."status"
     FROM "posts_likes" AS pl
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" != '${LikeStatusEnum.None}' AND
     pl."userId" = $2 AND pl."postId" = p."id"
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
     WHERE pl."postId" = p."id"
     ORDER BY pl."addedAt" DESC
     LIMIT 3
     ) AS pl
     LEFT JOIN "users" AS u
     ON u."id" = pl."userId"
     LEFT JOIN "users_ban" AS ub
     ON ub."userId" = u."id"
     LEFT JOIN "like_status_enum" AS lse
     ON lse."id" = pl."status"
     WHERE lse."status" = '${LikeStatusEnum.Like}' AND ub."isBanned" != true
     ) AS "newestLikes"
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
    'id', td."id", 'title', td."title", 'shortDescription', td."shortDescription", 'content', td."content", 'blogId', td."blogId", 'blogName', td."blogName", 'createdAt', td."createdAt",
    'myStatus', td."myStatus", 'likesCount', td."likesCount", 'dislikesCount', td."dislikesCount", 'newestLikes', td."newestLikes"
    )
    ) FROM "temp_data2" AS td

    ) AS "data"
    `,
      [`${blogId}`, userId],
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
  }*/

  async findPostById(postId: number): Promise<ResultDTO<ViewPostModel>> {
    const post = await this.postsRepo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.createdAt',
        'p.blogId',
        'b.name',
      ])
      .leftJoin('p.blog', 'b')
      .where('p.id = :postId', { postId })
      .getOne();

    if (!post) return new ResultDTO(InternalCode.NotFound);
    return new ResultDTO(InternalCode.Success, this._mapPostToView(post));
  }

  _mapPostToView(post: Post): ViewPostModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post?.blog.name,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
    };
  }
}
