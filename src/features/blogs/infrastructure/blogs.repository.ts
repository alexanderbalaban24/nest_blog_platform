import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(blogId: string): Promise<BlogDocument> {
    const blogInstance = this.BlogModel.findById(blogId);
    if (!blogInstance) throw new NotFoundException();

    return blogInstance;
  }

  async create(blogInstance: BlogDocument): Promise<string> {
    const createdBlogInstance = await blogInstance.save();

    return createdBlogInstance._id.toString();
  }

  async save(blogInstance: BlogDocument): Promise<boolean> {
    await blogInstance.save();

    return true;
  }
}
