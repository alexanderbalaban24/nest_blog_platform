import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostModelType } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsRepository: PostsRepository,
  ) {}

  async createPost(
    blogId: string,
    title: string,
    shortDescription: string,
    content: string,
  ) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

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
    postId,
    blogId: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<boolean> {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    const postInstance = await this.PostsRepository.findById(postId);
    if (!postInstance) throw new NotFoundException();

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
    if (!postInstance) throw new NotFoundException();

    await postInstance.deleteOne();

    return true;
  }
}
