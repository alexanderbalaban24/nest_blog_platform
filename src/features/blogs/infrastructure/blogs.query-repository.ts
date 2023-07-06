import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { ViewBlogModel } from '../api/models/view/ViewBlogModel';
import { QueryParamsBlogModel } from '../api/models/input/QueryParamsBlogModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findBlogs(
    query: QueryParamsBlogModel,
  ): Promise<ResultDTO<QueryBuildDTO<Blog, ViewBlogModel>>> {
    const blogsData = await this.BlogModel.find({}).findWithQuery<
      Blog,
      ViewBlogModel
    >(query);
    blogsData.map(this._mapBlogToView);

    return new ResultDTO(InternalCode.Success, blogsData);
  }

  async findBlogById(blogId: string): Promise<ResultDTO<ViewBlogModel>> {
    const blog = await this.BlogModel.findById(blogId).lean();
    if (!blog) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapBlogToView(blog));
  }

  _mapBlogToView(blog: BlogDocument): ViewBlogModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
