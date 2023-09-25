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
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from '../models/input/QueryParamsBlogModel';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { QueryBuildDTO } from '../../../../shared/dto';
import { ViewBlogModel } from '../models/view/ViewBlogModel';
import { CommandBus } from '@nestjs/cqrs';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { CreateBlogModel } from '../models/input/CreateBlogModel';
import { CreateBlogCommand } from '../../application/use-cases/create-blog-use-case';
import { DeleteBlogCommand } from '../../application/use-cases/delete-blog-use-case';
import { UpdateBlogCommand } from '../../application/use-cases/update-blog-use-case';
import { CreatePostWithoutIdModel } from '../models/input/CreatePostWithoutIdModel';
import { ViewPostModel } from '../../../posts/api/models/view/ViewPostModel';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post-use-case';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts/posts.query-repository';
import { CreatePostModel } from '../../../posts/api/models/input/CreatePostModel';
import { ExistingPostPipe } from '../../../../infrastructure/pipes/ExistingPost.pipe';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.param.decorator';
import { UpdatePostCommand } from '../../application/use-cases/update-post-in-blog-use-case';
import { DeletePostCommand } from '../../application/use-cases/delete-post-in-blog-use-case';
import { QueryParamsPostModel } from '../../../posts/api/models/input/QueryParamsPostModel';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllBlogs(
    @Query() queryData: QueryParamsBlogModel,
  ): Promise<QueryBuildDTO<any, ViewBlogModel>> {
    const blogResult = await this.blogsQueryRepository.findBlogsForSA(
      queryData,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Post()
  async createBlog(
    @Body() inputModel: CreateBlogModel,
  ): Promise<ViewBlogModel> {
    const createdBlogResult = await this.commandBus.execute(
      new CreateBlogCommand(
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
      ),
    );
    this.sendExceptionOrResponse(createdBlogResult);

    const blogResult = await this.blogsQueryRepository.findBlogById(
      createdBlogResult.payload.blogId,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  /*@Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindUser(
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Param('userId', ExistingUserPipe) userId: string,
  ): Promise<void> {
    const bindResult = await this.commandBus.execute(
      new BindUserCommand(blogId, userId),
    );

    return this.sendExceptionOrResponse(bindResult);
  }

  @Put(':blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Body() inputData: BanBlogModel,
  ): Promise<void> {
    const banResult = await this.commandBus.execute(
      new BanUnbanBlogCommand(blogId, inputData.isBanned),
    );

    return this.sendExceptionOrResponse(banResult);
  }*/

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputModel: CreateBlogModel,
  ): Promise<void> {
    const updatedResult = await this.commandBus.execute(
      new UpdateBlogCommand(
        blogId,
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
      ),
    );

    return this.sendExceptionOrResponse(updatedResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
  ): Promise<void> {
    const deletedResult = await this.commandBus.execute(
      new DeleteBlogCommand(blogId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsPostModel,
  ): Promise<QueryBuildDTO<any, ViewPostModel>> {
    const postResult = await this.postsQueryRepository.findPosts(
      queryData,
      blogId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputData: CreatePostWithoutIdModel,
  ): Promise<ViewPostModel> {
    const createdPostResult = await this.commandBus.execute(
      new CreatePostCommand(
        blogId,
        inputData.title,
        inputData.shortDescription,
        inputData.content,
      ),
    );
    this.sendExceptionOrResponse(createdPostResult);

    const postResult = await this.postsQueryRepository.findPostById(
      createdPostResult.payload.postId,
    );
    return this.sendExceptionOrResponse(postResult);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputData: CreatePostModel,
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Param('postId', ExistingPostPipe) postId: string,
  ): Promise<void> {
    const updateResult = await this.commandBus.execute(
      new UpdatePostCommand(
        blogId,
        postId,
        inputData.title,
        inputData.shortDescription,
        inputData.content,
      ),
    );

    return this.sendExceptionOrResponse(updateResult);
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Param('postId', ExistingPostPipe) postId: string,
  ): Promise<void> {
    const deletedResult = await this.commandBus.execute(
      new DeletePostCommand(blogId, postId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }
}
