import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { ResultDTO } from '../../../shared/dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private CommentRepository: CommentsRepository,
    private PostsQueryRepository: PostsQueryRepository,
    private UsersQueryRepository: UsersQueryRepository,
  ) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
  ): Promise<ResultDTO<{ commentId: string }>> {
    const postResult = await this.PostsQueryRepository.findPostById(postId);
    if (postResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const userResult = await this.UsersQueryRepository.findUserById(userId);
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const newCommentInstance = await this.CommentModel.makeInstance(
      postResult.payload.id,
      content,
      userResult.payload.id,
      userResult.payload.login,
      this.CommentModel,
    );

    return this.CommentRepository.create(newCommentInstance);
  }

  async updateComment(
    commentId: string,
    content: string,
    currentUserId: string,
  ): Promise<ResultDTO<null>> {
    const commentResult = await this.CommentRepository.findById(commentId);
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    if (commentResult.payload.commentatorInfo.userId !== currentUserId)
      return new ResultDTO(InternalCode.Forbidden);

    commentResult.payload.updateData(content, currentUserId);

    return this.CommentRepository.save(commentResult.payload);
  }

  async deleteComment(
    commentId: string,
    currentUserId: string,
  ): Promise<ResultDTO<null>> {
    const commentResult = await this.CommentRepository.findById(commentId);
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    if (commentResult.payload.commentatorInfo.userId !== currentUserId)
      return new ResultDTO(InternalCode.Forbidden);
    await commentResult.payload.deleteOne();

    return new ResultDTO(InternalCode.Success);
  }

  async likeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<ResultDTO<null>> {
    const commentResult = await this.CommentRepository.findById(commentId);
    if (commentResult.hasError()) return commentResult as ResultDTO<null>;

    commentResult.payload.like(userId, likeStatus);

    return this.CommentRepository.save(commentResult.payload);
  }
}
