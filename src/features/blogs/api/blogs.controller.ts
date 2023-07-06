import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreatePostWithoutIdModel } from './models/input/CreatePostWithoutIdModel';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ExistingBlogPipe } from '../../../infrastructure/pipes/ExistingBlog.pipe';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { ViewPostModel } from '../../posts/api/models/view/ViewPostModel';
import { QueryBuildDTO } from '../../../shared/dto';
import { Post as PostDB } from '../../posts/domain/posts.entity';
import { ViewBlogModel } from './models/view/ViewBlogModel';
import { Blog } from '../domain/blogs.entity';

@Controller('blogs')
export class BlogsController extends ExceptionAndResponseHelper {
  constructor(
    private BlogsService: BlogsService,
    private PostsService: PostsService,
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsQueryRepository: PostsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllBlogs(
    @Query() queryData: QueryParamsBlogModel,
  ): Promise<QueryBuildDTO<Blog, ViewBlogModel>> {
    const blogResult = await this.BlogsQueryRepository.findBlogs(queryData);

    return this.sendExceptionOrResponse(blogResult);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() inputModel: CreateBlogModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewBlogModel> {
    const createdBlogResult = await this.BlogsService.createBlog(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
    this.sendExceptionOrResponse(createdBlogResult);

    const blogResult = await this.BlogsQueryRepository.findBlogById(
      createdBlogResult.payload.blogId,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Get(':id')
  async getBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
  ): Promise<ViewBlogModel> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(blogId);

    return this.sendExceptionOrResponse(blogResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
  ): Promise<void> {
    const deletedResult = await this.BlogsService.deleteBlog(blogId);

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputModel: CreateBlogModel,
  ): Promise<void> {
    const updatedResult = await this.BlogsService.updateBlog(
      blogId,
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );

    return this.sendExceptionOrResponse(updatedResult);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<PostDB, ViewPostModel>> {
    const postResult = await this.PostsQueryRepository.findPosts(
      queryData,
      blogId,
      currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputData: CreatePostWithoutIdModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewPostModel> {
    const createdPostResult = await this.PostsService.createPost(
      blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );
    this.sendExceptionOrResponse(createdPostResult);

    const postResult = await this.PostsQueryRepository.findPostById(
      createdPostResult.payload.postId,
      currentUserId,
    );
    return this.sendExceptionOrResponse(postResult);
  }
}
