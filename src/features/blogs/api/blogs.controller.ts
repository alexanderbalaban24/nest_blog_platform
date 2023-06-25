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
  UseGuards,
} from '@nestjs/common';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from './models/input/QueryParamsBlogModel';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { QueryParamsPostModel } from '../../posts/api/models/input/QueryParamsPostModel';
import { ParseObjectIdPipe } from '../../../infrastructure/pipes/ParseObjectId.pipe';
import { CreatePostWithoutIdModel } from './models/input/CreatePostWithoutIdModel';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ExistingBlogPipe } from '../../../infrastructure/pipes/ExistingBlog.pipe';

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
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() inputModel: CreateBlogModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const createdBlogId = await this.BlogsService.createBlog(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );

    return await this.BlogsQueryRepository.findBlogById(createdBlogId);
  }

  @Get(':id')
  async getBlog(@Param('id', ExistingBlogPipe) blogId: string) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    return blog;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id', ExistingBlogPipe) blogId: string) {
    return await this.BlogsService.deleteBlog(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
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
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const blog = await this.BlogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    const post = this.PostsQueryRepository.findPosts(
      queryData,
      blogId,
      currentUserId,
    );
    if (!post) throw new NotFoundException();

    return post;
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputData: CreatePostWithoutIdModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const createdPostId = await this.PostsService.createPost(
      blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );

    return await this.PostsQueryRepository.findPostById(
      createdPostId,
      currentUserId,
    );
  }
}
