import { Injectable } from '@nestjs/common';
import { ViewPostModel } from '../../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO, ResultDTO } from '../../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';

@Injectable()
export class PostsLikeQueryRepository {
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
