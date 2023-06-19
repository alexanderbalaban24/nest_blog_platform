import { Injectable } from '@nestjs/common';
import { Blog, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private BlogsRepository: BlogsRepository,
  ) {}

  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<Types.ObjectId> {
    const newBlogInstance = this.BlogModel.makeInstance(
      name,
      description,
      websiteUrl,
      this.BlogModel,
    );

    return await this.BlogsRepository.create(newBlogInstance);
  }

  async deleteBlog(blogId: Types.ObjectId): Promise<boolean> {
    const blogInstance = await this.BlogsRepository.findById(blogId);
    if (!blogInstance) return false;

    await blogInstance.deleteOne();

    return true;
  }

  async updateBlog(
    blogId: Types.ObjectId,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const blogInstance = await this.BlogsRepository.findById(blogId);
    if (!blogInstance) return false;

    await blogInstance.changeData(name, description, websiteUrl);

    return await this.BlogsRepository.save(blogInstance);
  }
}
