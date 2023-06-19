import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { QueryParamsPostModel } from '../../posts/api/models/input/QueryParamsPostModel';
import { ParseObjectIdPipe } from '../../../shared/pipes';
import { Types } from 'mongoose';
import { CreatePostWithoutIdModel } from './models/input/CreatePostWithoutIdModel';

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
  async getBlog(@Param('id', ParseObjectIdPipe) blogId: Types.ObjectId) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    return blog;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ParseObjectIdPipe) blogId: Types.ObjectId) {
    return await this.BlogsService.deleteBlog(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() inputModel: CreateBlogModel,
  ) {
    return await this.BlogsService.updateBlog(
      blogId,
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Query() queryData: QueryParamsPostModel,
  ) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    const post = this.PostsQueryRepository.findPosts(queryData, blogId);
    if (!post) throw new NotFoundException();

    return post;
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() inputData: CreatePostWithoutIdModel,
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
