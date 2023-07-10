import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.entity';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { ViewCommentModel } from '../api/models/view/ViewCommentModel';
import { QueryParamsCommentModel } from '../api/models/input/QueryParamsCommentModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { Types } from 'mongoose';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findComments(
    postId: string,
    query: QueryParamsCommentModel,
    userId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Comment, ViewCommentModel>>> {
    const commentsData = await this.CommentModel.find({
      postId,
      isDeactivate: { $ne: false },
    }).findWithQuery<Comment, ViewCommentModel>(query);
    commentsData.map((comment) => this._mapCommentToView(comment, userId));

    return new ResultDTO(InternalCode.Success, commentsData);
  }

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<ResultDTO<ViewCommentModel>> {
    const comment = await this.CommentModel.findOne({
      _id: new Types.ObjectId(commentId),
      isDeactivate: { $ne: true },
    }).lean();
    if (!comment) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapCommentToView(comment, userId),
    );
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
