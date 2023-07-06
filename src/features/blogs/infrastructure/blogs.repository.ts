import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(blogId: string): Promise<ResultDTO<BlogDocument>> {
    const blogInstance = await this.BlogModel.findById(blogId);
    return new ResultDTO<BlogDocument>(InternalCode.Success, blogInstance);
  }

  async create(
    blogInstance: BlogDocument,
  ): Promise<ResultDTO<{ blogId: string }>> {
    const createdBlogInstance = await blogInstance.save();

    return new ResultDTO(InternalCode.Success, {
      blogId: createdBlogInstance._id.toString(),
    });
  }

  async save(blogInstance: BlogDocument): Promise<ResultDTO<null>> {
    await blogInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
