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
import { CreateBlogModel } from '../models/input/CreateBlogModel';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from '../models/input/QueryParamsBlogModel';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query-repository';
import { QueryParamsPostModel } from '../../../posts/api/models/input/QueryParamsPostModel';
import { CreatePostWithoutIdModel } from '../models/input/CreatePostWithoutIdModel';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.param.decorator';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { ViewPostModel } from '../../../posts/api/models/view/ViewPostModel';
import { QueryBuildDTO } from '../../../../shared/dto';
import { Post as PostDB } from '../../../posts/domain/posts.entity';
import { ViewBlogModel } from '../models/view/ViewBlogModel';
import { Blog } from '../../domain/blogs.entity';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../../application/use-cases/create-blog-use-case';
import { DeleteBlogCommand } from '../../application/use-cases/delete-blog-use-case';
import { UpdateBlogCommand } from '../../application/use-cases/update-blog-use-case';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post-use-case';
import { ExistingPostPipe } from '../../../../infrastructure/pipes/ExistingPost.pipe';
import { CreatePostModel } from '../../../posts/api/models/input/CreatePostModel';
import { UpdatePostCommand } from '../../application/use-cases/update-post-in-blog-use-case';
import { DeletePostCommand } from '../../application/use-cases/delete-post-in-blog-use-case';
import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query-repository';
import { JwtAccessAuthGuard } from '../../../auth/guards/jwt-access-auth.guard';
import { QueryParamsCommentModel } from '../../../comments/api/models/input/QueryParamsCommentModel';

@UseGuards(JwtAccessAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsQueryRepository: PostsQueryRepository,
    private CommentsQueryRepository: CommentsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllBlogs(
    @Query() queryData: QueryParamsBlogModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<Blog, ViewBlogModel>> {
    const blogResult = await this.BlogsQueryRepository.findBlogs(
      queryData,
      currentUserId,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Post()
  async createBlog(
    @Body() inputModel: CreateBlogModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewBlogModel> {
    const createdBlogResult = await this.CommandBus.execute(
      new CreateBlogCommand(
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
        currentUserId,
      ),
    );
    this.sendExceptionOrResponse(createdBlogResult);

    const blogResult = await this.BlogsQueryRepository.findBlogById(
      createdBlogResult.payload.blogId,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const deletedResult = await this.CommandBus.execute(
      new DeleteBlogCommand(currentUserId, blogId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputModel: CreateBlogModel,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const updatedResult = await this.CommandBus.execute(
      new UpdateBlogCommand(
        userId,
        blogId,
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
      ),
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
  async createPostByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Body() inputData: CreatePostWithoutIdModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewPostModel> {
    const createdPostResult = await this.CommandBus.execute(
      new CreatePostCommand(
        currentUserId,
        blogId,
        inputData.title,
        inputData.shortDescription,
        inputData.content,
      ),
    );
    this.sendExceptionOrResponse(createdPostResult);

    const postResult = await this.PostsQueryRepository.findPostById(
      createdPostResult.payload.postId,
      currentUserId,
    );
    return this.sendExceptionOrResponse(postResult);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputData: CreatePostModel,
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Param('postId', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const updateResult = await this.CommandBus.execute(
      new UpdatePostCommand(
        blogId,
        postId,
        currentUserId,
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
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const deletedResult = await this.CommandBus.execute(
      new DeletePostCommand(blogId, postId, currentUserId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Get('comments')
  async getCommentsForAllPostsForAllUserBlogs(
    @Query() queryData: QueryParamsCommentModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const blogsResult =
      await this.CommentsQueryRepository.getCommentsForAllPostsForAllUserBlogs(
        queryData,
        '64c540fd53fcda0ea0b1027d',
      );

    return this.sendExceptionOrResponse(blogsResult);
  }
}
