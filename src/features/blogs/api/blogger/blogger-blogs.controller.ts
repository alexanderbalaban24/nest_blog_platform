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
import { ViewBlogModel } from '../models/view/ViewBlogModel';
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
  ): Promise<QueryBuildDTO<any, ViewBlogModel>> {
    const blogResult = await this.BlogsQueryRepository.findBlogs(
      queryData,
      currentUserId,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<any, ViewPostModel>> {
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
        currentUserId,
      );

    return this.sendExceptionOrResponse(blogsResult);
  }
}
