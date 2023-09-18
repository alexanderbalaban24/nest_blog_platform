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
