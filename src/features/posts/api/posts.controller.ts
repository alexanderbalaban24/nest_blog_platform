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
import { QueryParamsPostModel } from './models/input/QueryParamsPostModel';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreatePostModel } from './models/input/CreatePostModel';
import { PostsService } from '../application/posts.service';
import { CreateCommentModel } from './models/input/CreateCommentModel';
import { CommentsService } from '../../comments/application/comments.service';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { QueryParamsCommentModel } from '../../comments/api/models/input/QueryParamsCommentModel';
import { ExistingPostPipe } from '../../../infrastructure/pipes/ExistingPost.pipe';
import { LikeStatusModel } from './models/input/LikeStatusModel';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private PostsQueryRepository: PostsQueryRepository,
    private PostsService: PostsService,
    private CommentService: CommentsService,
    private CommentQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getAllPosts(
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.PostsQueryRepository.findPosts(
      queryData,
      undefined,
      currentUserId,
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() inputData: CreatePostModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const createdPostId = await this.PostsService.createPost(
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );

    return await this.PostsQueryRepository.findPostById(
      createdPostId,
      currentUserId,
    );
  }

  @Get(':id')
  async getPost(
    @Param('id', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const post = await this.PostsQueryRepository.findPostById(
      postId,
      currentUserId,
    );
    if (!post) throw new NotFoundException();

    return post;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param('id', ExistingPostPipe) postId: string,
    @Body() inputData: CreatePostModel,
  ): Promise<boolean> {
    return await this.PostsService.updatePost(
      postId,
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ExistingPostPipe) postId: string) {
    return await this.PostsService.deletePost(postId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('id', ExistingPostPipe) postId: string,
    @Body() inputModel: CreateCommentModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const commentId = await this.CommentService.createComment(
      postId,
      inputModel.content,
      currentUserId,
    );
    if (!commentId) throw new NotFoundException();

    return await this.CommentQueryRepository.findCommentById(
      commentId,
      currentUserId,
    );
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id', ExistingPostPipe) postId: string,
    @Query() queryData: QueryParamsCommentModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const commentsData = await this.CommentQueryRepository.findComments(
      postId,
      queryData,
      currentUserId,
    );
    if (!commentsData) throw new NotFoundException();

    return commentsData;
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async likeStatus(
    @Param('id', ExistingPostPipe) postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() inputModel: LikeStatusModel,
  ) {
    return this.PostsService.likeStatus(
      postId,
      currentUserId,
      inputModel.likeStatus,
    );
  }
}
