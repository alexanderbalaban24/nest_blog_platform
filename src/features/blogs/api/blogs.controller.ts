import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from './models/input/QueryParamsBlogModel';
import { UpdateBlogModel } from './models/input/UpdateBlogModel';
import { CreatePostModel } from '../../posts/api/models/input/CreatePostModel';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { QueryParamsPostModel } from '../../posts/api/models/input/QueryParamsPostModel';

@Controller('blogs')
export class BlogsController {
  constructor(
    private BlogsService: BlogsService,
    private PostsService: PostsService,
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(@Query() queryData: QueryParamsBlogModel) {
    return this.BlogsQueryRepository.findBlogs(queryData);
  }

  @Post()
  async createBlog(@Body() inputModel: CreateBlogModel) {
    const createdBlogId = await this.BlogsService.createBlog(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );

    return await this.BlogsQueryRepository.findBlogById(createdBlogId);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    return blog;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId) {
    return await this.BlogsService.deleteBlog(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') blogId, @Body() inputModel: UpdateBlogModel) {
    return await this.BlogsService.updateBlog(
      blogId,
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') blogId,
    @Query() queryData: QueryParamsPostModel,
  ) {
    const post = this.PostsQueryRepository.findPosts(queryData, blogId);
    if (!post) throw new NotFoundException();

    return post;
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId,
    @Body() inputData: CreatePostModel,
  ) {
    const createdPostId = await this.PostsService.createPost(
      blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );

    return await this.PostsQueryRepository.findPostById(createdPostId);
  }
}
