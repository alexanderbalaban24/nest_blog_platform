import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { ViewBlogModel } from '../api/models/view/ViewBlogModel';
import { QueryParamsBlogModel } from '../api/models/input/QueryParamsBlogModel';
import { QueryBuildDTO } from '../../../shared/dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findBlogs(
    query: QueryParamsBlogModel,
  ): Promise<QueryBuildDTO<Blog, ViewBlogModel>> {
    const blogsData = await this.BlogModel.find({}).findWithQuery<
      Blog,
      ViewBlogModel
    >(query);
    blogsData.map(this._mapBlogToView);

    return blogsData;
  }

  async findBlogById(blogId: string): Promise<ViewBlogModel | null> {
    const blog = await this.BlogModel.findById(blogId).lean();
    if (!blog) return null;

    return this._mapBlogToView(blog);
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
