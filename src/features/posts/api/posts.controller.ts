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
import { QueryParamsPostModel } from './models/input/QueryParamsPostModel';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreatePostModel } from './models/input/CreatePostModel';
import { PostsService } from '../application/posts.service';
import { CreateCommentModel } from './models/input/CreateCommentModel';
import { CommentsService } from '../../comments/application/comments.service';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { QueryParamsCommentModel } from '../../comments/api/models/input/QueryParamsCommentModel';
import { ExistingPostPipe } from '../../../infrastructure/pipes/ExistingPost.pipe';
import { LikeStatusModel } from './models/input/LikeStatusModel';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { QueryBuildDTO } from '../../../shared/dto';
import { Post as PostDB } from '../domain/posts.entity';
import { ViewPostModel } from './models/view/ViewPostModel';
import { ViewCommentModel } from '../../comments/api/models/view/ViewCommentModel';
import { Comment } from '../../comments/domain/comments.entity';

@Controller('posts')
export class PostsController extends ExceptionAndResponseHelper {
  constructor(
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
  ): Promise<QueryBuildDTO<PostDB, ViewPostModel>> {
    const postResult = await this.PostsQueryRepository.findPosts(
      queryData,
      undefined,
      currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() inputData: CreatePostModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewPostModel> {
    const createdPostResult = await this.PostsService.createPost(
      inputData.blogId,
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

  @Get(':id')
  async getPost(
    @Param('id', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewPostModel> {
    const postResult = await this.PostsQueryRepository.findPostById(
      postId,
      currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param('id', ExistingPostPipe) postId: string,
    @Body() inputData: CreatePostModel,
  ): Promise<void> {
    const updatedResult = await this.PostsService.updatePost(
      postId,
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );

    return this.sendExceptionOrResponse(updatedResult);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ExistingPostPipe) postId: string,
  ): Promise<void> {
    const deletedResult = await this.PostsService.deletePost(postId);

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Post(':id/comments')
  @UseGuards(JwtAccessAuthGuard)
  async createComment(
    @Param('id', ExistingPostPipe) postId: string,
    @Body() inputModel: CreateCommentModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewCommentModel> {
    const createdCommentResult = await this.CommentService.createComment(
      postId,
      inputModel.content,
      currentUserId,
    );
    this.sendExceptionOrResponse(createdCommentResult);

    const commentResult = await this.CommentQueryRepository.findCommentById(
      createdCommentResult.payload.commentId,
      currentUserId,
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
      currentUserId,
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
    const likeResult = await this.PostsService.likeStatus(
      postId,
      currentUserId,
      inputModel.likeStatus,
    );

    return this.sendExceptionOrResponse(likeResult);
  }
}
