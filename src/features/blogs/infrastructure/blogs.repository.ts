import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(blogId: Types.ObjectId): Promise<BlogDocument> {
    return this.BlogModel.findById(blogId);
  }

  async create(blogInstance: BlogDocument): Promise<Types.ObjectId> {
    const createdBlogInstance = await blogInstance.save();

    return createdBlogInstance._id;
  }

  async save(blogInstance: BlogDocument): Promise<boolean> {
    await blogInstance.save();

    return true;
  }
}
