import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { LikeStatusEnum } from '../../../shared/enums';
import { ViewCommentModel } from '../api/models/view/ViewCommentModel';
import { QueryParamsCommentModel } from '../api/models/input/QueryParamsCommentModel';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findComments(
    postId: string,
    query: QueryParamsCommentModel,
    userId?: string,
  ) {
    const commentsData = await this.CommentModel.find({ postId }).findWithQuery<
      Comment,
      ViewCommentModel
    >(query);
    commentsData.map((comment) => this._mapCommentToView(comment, userId));

    return commentsData;
  }

  async findCommentById(commentId: string, userId?: string) {
    const comment = await this.CommentModel.findById(commentId).lean();
    if (!comment) return null;

    return this._mapCommentToView(comment, userId);
  }

  _mapCommentToView(comment: Comment, userId?: string): ViewCommentModel {
    const userLikeData = comment.usersLikes.find(
      (item) => item.userId === userId,
    );
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: userLikeData?.likeStatus ?? LikeStatusEnum.None,
      },
    };
  }
}
