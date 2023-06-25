import { Injectable } from '@nestjs/common';
import { Post, PostModelType } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { LikeStatusEnum } from '../../../shared/enums';
import { UsersRepository } from '../../users/infrastructure/users.repository';

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
  ): Promise<string | null> {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) return null;

    const postInstance = await this.PostModel.makeInstance(
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
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
  ): Promise<boolean> {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) return false;

    const postInstance = await this.PostsRepository.findById(postId);
    if (!postInstance) return false;

    await postInstance.changeData(
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
    );

    return await this.PostsRepository.save(postInstance);
  }

  async deletePost(postId: string): Promise<boolean> {
    const postInstance = await this.PostsRepository.findById(postId);
    if (!postInstance) return false;

    await postInstance.deleteOne();

    return true;
  }

  async likeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<boolean> {
    const postInstance = await this.PostsRepository.findById(postId);
    if (!postInstance) return false;

    const userInstance = await this.UsersRepository.findById(userId);
    if (!userInstance) return false;

    postInstance.like(userId, userInstance.login, likeStatus);

    return this.PostsRepository.save(postInstance);
  }
}
