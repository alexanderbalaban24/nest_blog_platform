import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { LikeStatusEnum } from '../../../shared/enums';

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
  ): Promise<string> {
    const post = await this.PostsQueryRepository.findPostById(postId);
    if (!post) return null;

    const user = await this.UsersQueryRepository.findUserById(userId);
    if (!user) return null;

    const newCommentInstance = await this.CommentModel.makeInstance(
      post.id,
      content,
      user.id,
      user.login,
      this.CommentModel,
    );

    return this.CommentRepository.create(newCommentInstance);
  }

  async updateComment(
    commentId: string,
    content: string,
    currentUserId: string,
  ): Promise<boolean> {
    const commentInstance = await this.CommentRepository.findById(commentId);
    if (!commentInstance) return false;

    //TODO здесь не должно быть этого эксепшена, когда сделаю общение между слоями надо убрать
    if (commentInstance.commentatorInfo.userId !== currentUserId)
      throw new ForbiddenException();
    commentInstance.updateData(content, currentUserId);

    return this.CommentRepository.save(commentInstance);
  }

  async deleteComment(
    commentId: string,
    currentUserId: string,
  ): Promise<boolean> {
    const commentInstance = await this.CommentRepository.findById(commentId);
    if (!commentInstance) return false;

    if (commentInstance.commentatorInfo.userId !== currentUserId)
      throw new ForbiddenException();
    await commentInstance.deleteOne();

    return true;
  }

  async likeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<boolean> {
    const commentInstance = await this.CommentRepository.findById(commentId);
    if (!commentInstance) return false;

    commentInstance.like(userId, likeStatus);

    return this.CommentRepository.save(commentInstance);
  }
}
