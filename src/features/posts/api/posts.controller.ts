import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryParamsPostModel } from './models/input/QueryParamsPostModel';
import { PostsQueryRepository } from '../infrastructure/posts/posts.query-repository';
import { PostsService } from '../application/posts.service';
import { CreateCommentModel } from './models/input/CreateCommentModel';
import { CommentsService } from '../../comments/application/comments.service';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { CommentsQueryRepository } from '../../comments/infrastructure/comment/comments.query-repository';
import { QueryParamsCommentModel } from '../../comments/api/models/input/QueryParamsCommentModel';
import { ExistingPostPipe } from '../../../infrastructure/pipes/ExistingPost.pipe';
import { LikeStatusModel } from './models/input/LikeStatusModel';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { QueryBuildDTO } from '../../../shared/dto';
import { ViewPostModel } from './models/view/ViewPostModel';
import { ViewCommentModel } from '../../comments/api/models/view/ViewCommentModel';
import { CommandBus } from '@nestjs/cqrs';
import { LikeStatusPostCommand } from '../application/use-cases/like-status-post-use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';

@Controller('posts')
export class PostsController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private PostsQueryRepository: PostsQueryRepository,
    private PostsService: PostsService,
    private CommentService: CommentsService,
    private CommentQueryRepository: CommentsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllPosts(
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<any, ViewPostModel>> {
    const postResult = await this.PostsQueryRepository.findPosts(
      queryData,
      undefined,
      +currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Get(':id')
  async getPost(
    @Param('id', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewPostModel> {
    const postResult = await this.PostsQueryRepository.findPostById(
      +postId,
      +currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Post(':id/comments')
  @UseGuards(JwtAccessAuthGuard)
  async createComment(
    @Param('id', ExistingPostPipe) postId: string,
    @Body() inputModel: CreateCommentModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewCommentModel> {
    const createdCommentResult = await this.CommandBus.execute(
      new CreateCommentCommand(+postId, inputModel.content, currentUserId),
    );
    this.sendExceptionOrResponse(createdCommentResult);

    const commentResult = await this.CommentQueryRepository.findCommentById(
      createdCommentResult.payload.commentId,
      +currentUserId,
    );

    return this.sendExceptionOrResponse(commentResult);
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id', ExistingPostPipe) postId: string,
    @Query() queryData: QueryParamsCommentModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<Comment, ViewCommentModel>> {
    const commentsResult = await this.CommentQueryRepository.findComments(
      postId,
      queryData,
      +currentUserId,
    );

    return this.sendExceptionOrResponse(commentsResult);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async likeStatus(
    @Param('id', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() inputModel: LikeStatusModel,
  ): Promise<void> {
    console.log('-------------LIKE', currentUserId, inputModel.likeStatus);
    const likeResult = await this.CommandBus.execute(
      new LikeStatusPostCommand(postId, currentUserId, inputModel.likeStatus),
    );

    return this.sendExceptionOrResponse(likeResult);
  }
}
