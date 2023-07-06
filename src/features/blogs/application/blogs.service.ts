import { Injectable } from '@nestjs/common';
import { Blog, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

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
  ): Promise<ResultDTO<{ blogId: string }>> {
    const newBlogInstance = this.BlogModel.makeInstance(
      name,
      description,
      websiteUrl,
      this.BlogModel,
    );

    return this.BlogsRepository.create(newBlogInstance);
  }

  async deleteBlog(blogId: string): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsRepository.findById(blogId);
    if (blogResult.hasError()) return new ResultDTO(blogResult.code);

    await blogResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }

  async updateBlog(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<ResultDTO<null>> {
    const blogResult = await this.BlogsRepository.findById(blogId);
    if (blogResult.hasError()) return new ResultDTO(blogResult.code);

    await blogResult.payload.changeData(name, description, websiteUrl);

    return this.BlogsRepository.save(blogResult.payload);
  }
}
