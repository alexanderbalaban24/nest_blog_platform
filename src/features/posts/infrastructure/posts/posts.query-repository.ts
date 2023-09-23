import { Injectable } from '@nestjs/common';
import { ViewPostModel } from '../../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO, ResultDTO } from '../../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostLike } from '../../entities/post-like.entity';
import { UserLikeType } from '../../../../shared/types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
  ) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
    userId?: number,
  ): Promise<ResultDTO<QueryBuildDTO<Post, ViewPostModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const postsBuilder = await this.postsRepo
      .createQueryBuilder('p')
      .orderBy(
        sortBy !== 'blogName' ? `p.${sortBy}` : 'b.name',
        sortDirection as 'ASC' | 'DESC',
      )
      .select([
        'p."id"',
        'p."title"',
        'p."shortDescription"',
        'p."content"',
        'p."createdAt"',
        'p."blogId"',
        'b."name"',
      ])
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'likesCount')
          .from('post_likes', 'l')
          .where({ status: LikeStatusEnum.Like });
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'dislikesCount')
          .from('post_likes', 'l')
          .where({ status: LikeStatusEnum.Dislike });
      })
      .addSelect((qb) => {
        return qb
          .select('l."status"', 'myStatus')
          .from('post_likes', 'l')
          .where({ userId })
          .andWhere('p.id = l."postId"');
      })
      .leftJoin('p.blog', 'b') /*
      .leftJoinAndMapMany(
        'p.newestLikes',
        (qb) =>
          qb
            .select([
              'pl.createdAt as "addedAt"',
              'pl."postId"',
              'pl."userId"',
              'u."login"',
            ])
            .from('post_likes', 'pl')
            .leftJoin('pl.user', 'u')
            .orderBy('pl."createdAt"', 'DESC')
            .limit(3),
        'pl',
        'pl."postId" = p.id',
      )*/
      //.leftJoinAndSelect('post_likes', 'pl', 'pl.postId = p.id')
      /* .leftJoin(
        (qb) =>
          qb
            .select([
              'l.createdAt AS "addedAt"',
              'l."userId"',
              'u.id AS "userIds"',
              'u.login',
            ])
            .leftJoin((qb) => qb.select([]).from('users', 'u'), 'u', 'u = u')
            .from('post_likes', 'l')
            .where({ status: LikeStatusEnum.Like })
            .orderBy('l."createdAt"', 'DESC')
            .limit(3),
        'l',
        'l."userId" = l."userIds"',
      )*/
      .where(blogId ? 'b.id = :blogId' : 'b.id = b.id', { blogId });

    const postsRaw = await postsBuilder
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const likesBuilder = await this.dataSource
      .createQueryBuilder(PostLike, 'l')
      .orderBy('l.createdAt', 'DESC')
      .select(['l.postId', 'l.createdAt', 'u.login', 'u.id'])
      .where('l.postId in (:...ids)', { ids: postsRaw.map((p) => p.id) })
      .leftJoin('l.user', 'u')
      .getMany();

    const likes = {};

    postsRaw.forEach((post) => {
      if (!(post.id in likes)) likes[post.id] = [];

      likesBuilder
        .filter((like) => like.postId === post.id)
        .forEach((like) => {
          if (likes[post.id].length <= 3) {
            likes[post.id].push({
              createdAt: like?.createdAt,
              user: like?.user,
            });
          }
        });
    });

    const totalCount = await postsBuilder.getCount();

    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<Post, ViewPostModel>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      //@ts-ignore
      postsRaw,
    );
    console.log(likes);
    data.map((post) =>
      this._mapPostToView(post, ((post) => likes[post.id])(post)),
    );
    //@ts-ignore
    return new ResultDTO(InternalCode.Success, data);
  }

  /*async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
    userId?: number,
  ): Promise<ResultDTO<QueryBuildDTO<Post, ViewPostModel>>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() ?? 'DESC';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);

    const postsBuilder = await this.postsRepo
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
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'likesCount')
          .from('post_likes', 'l')
          .where({ status: LikeStatusEnum.Like });
      }, 'p.test')
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'dislikesCount')
          .from('post_likes', 'l')
          .where({ status: LikeStatusEnum.Dislike });
      })
      .addSelect((qb) => {
        return qb
          .select('l."status"', 'myStatus')
          .from('post_likes', 'l')
          .where({ userId })
          .andWhere('p.id = l."postId"');
      })
      .leftJoin('p.blog', 'b')
      .leftJoinAndMapMany(
        'p.newestLikes',
        (qb) =>
          qb
            .select([
              'pl.createdAt as "addedAt"',
              'pl."postId"',
              'pl."userId"',
              'u."login"',
            ])
            .from('post_likes', 'pl')
            .leftJoin('pl.user', 'u')
            .orderBy('pl."createdAt"', 'DESC')
            .limit(3),
        'pl',
        'pl."postId" = p.id',
      )
      //.leftJoinAndSelect('post_likes', 'pl', 'pl.postId = p.id')
      /!* .leftJoin(
        (qb) =>
          qb
            .select([
              'l.createdAt AS "addedAt"',
              'l."userId"',
              'u.id AS "userIds"',
              'u.login',
            ])
            .leftJoin((qb) => qb.select([]).from('users', 'u'), 'u', 'u = u')
            .from('post_likes', 'l')
            .where({ status: LikeStatusEnum.Like })
            .orderBy('l."createdAt"', 'DESC')
            .limit(3),
        'l',
        'l."userId" = l."userIds"',
      )*!/
      .where(blogId ? 'b.id = :blogId' : 'b.id = b.id', { blogId });

    const rawData = await builder.offset(offset).limit(pageSize).getRawMany();
    const postsObj = {};

    rawData.forEach((item) => {});

    const totalCount = await builder.getCount();
    console.log(totalCount);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<Post, ViewPostModel>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      rawData,
    );
    console.log(rawData);
    //data.map((post) => this._mapPostToView(post, []));
    //@ts-ignore
    return new ResultDTO(InternalCode.Success, rawData);
  }*/

  async findPostById(
    postId: number,
    userId?: number,
  ): Promise<ResultDTO<ViewPostModel>> {
    const post = await this.postsRepo
      .createQueryBuilder('p')
      .select([
        'p."id"',
        'p."title"',
        'p."shortDescription"',
        'p."content"',
        'p."createdAt"',
        'p."blogId"',
        'b."name"',
      ])
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'likesCount')
          .from('post_likes', 'l')
          .where({ postId, status: LikeStatusEnum.Like });
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'dislikesCount')
          .from('post_likes', 'l')
          .where({ postId, status: LikeStatusEnum.Dislike });
      })
      .addSelect((qb) => {
        return qb
          .select('l."status"', 'myStatus')
          .from('post_likes', 'l')
          .where({ userId })
          .andWhere('p.id = l."postId"');
      })
      .leftJoin('p.blog', 'b')
      .where('p.id = :postId', { postId })
      .getRawOne();

    if (!post) return new ResultDTO(InternalCode.NotFound);

    const newestLikes = await this.dataSource
      .getRepository(PostLike)
      .createQueryBuilder('l')
      .select(['l.createdAt'])
      .addSelect(['u.id', 'u.login'])
      .leftJoin('l.user', 'u')
      .where({ status: LikeStatusEnum.Like })
      .orderBy('l."createdAt"', 'DESC')
      .limit(3)
      .getMany();

    return new ResultDTO(
      InternalCode.Success,
      this._mapPostToView(post, newestLikes),
    );
  }

  _mapPostToView(post: any, likes: any): ViewPostModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post?.name,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: +post?.likesCount,
        dislikesCount: +post?.dislikesCount,
        myStatus: post?.myStatus ?? post?.myStatus ?? LikeStatusEnum.None,
        newestLikes: this._mapLikes(likes),
      },
    };
  }

  _mapLikes(likes: any): UserLikeType[] {
    if (!likes?.length) return [];

    return likes.map((like) => ({
      addedAt: like.createdAt,
      userId: like.user.id.toString(),
      login: like.user.login,
    }));
  }
}
