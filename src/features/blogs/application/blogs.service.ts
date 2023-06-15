import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../infrastructure/blogs.repository';

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
  ): Promise<string> {
    const newBlogInstance = this.BlogModel.makeInstance(
      name,
      description,
      websiteUrl,
      this.BlogModel,
    );

    return await this.BlogsRepository.create(newBlogInstance);
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    const blogInstance = await this.BlogsRepository.findById(blogId);
    if (!blogInstance) throw new NotFoundException();

    await blogInstance.deleteOne();

    return true;
  }

  async updateBlog(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const blogInstance = await this.BlogsRepository.findById(blogId);
    if (!blogInstance) throw new NotFoundException();

    await blogInstance.changeData(name, description, websiteUrl);

    return await this.BlogsRepository.save(blogInstance);
  }
}
