import { Injectable } from '@nestjs/common';
import { Post, PostModelType } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { ResultDTO } from '../../../shared/dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsRepository: PostsRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async createPost(
    blogId: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<ResultDTO<{ postId: string }>> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(blogId);
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const postInstance = await this.PostModel.makeInstance(
      title,
      shortDescription,
      content,
      blogId,
      blogResult.payload.name,
      this.PostModel,
    );

    return this.PostsRepository.create(postInstance);
  }

  async updatePost(
    postId: string,
    blogId: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(blogId);
    if (blogResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const postResult = await this.PostsRepository.findById(postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    await postResult.payload.changeData(
      title,
      shortDescription,
      content,
      blogId,
      blogResult.payload.name,
    );

    return await this.PostsRepository.save(postResult.payload);
  }

  async deletePost(postId: string): Promise<ResultDTO<null>> {
    const postResult = await this.PostsRepository.findById(postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    await postResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }

  async likeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<ResultDTO<null>> {
    const postResult = await this.PostsRepository.findById(postId);
    if (postResult.hasError()) return postResult as ResultDTO<null>;

    const userResult = await this.UsersRepository.findById(userId);
    if (userResult.hasError()) return userResult as ResultDTO<null>;

    postResult.payload.like(userId, userResult.payload.login, likeStatus);

    return this.PostsRepository.save(postResult.payload);
  }
}
