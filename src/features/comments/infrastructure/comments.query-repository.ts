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

  async getCommentsForAllPostsForAllUserBlogs(
    query: QueryParamsCommentModel,
    userId: string,
  ): Promise<ResultDTO<QueryBuildDTO<any, any>>> {
    const comments = this.CommentModel.aggregate([
      {
        $addFields: {
          postId: { $toObjectId: '$postId' },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'post',
        },
      },
      {
        $unwind: '$post',
      },
      { $addFields: { blogId: { $toObjectId: '$post.blogId' } } },
      {
        $lookup: {
          from: 'blogs',
          localField: 'blogId',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                'blogOwnerInfo.userId': userId,
                'banInfo.isBanned': false,
              },
            },
          ],
          as: 'blog',
        },
      },
      {
        $unwind: '$blog',
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          content: 1,
          commentatorInfo: '$commentatorInfo',
          createdAt: 1,
          'likesInfo.likesCount': '$likesCount',
          'likesInfo.dislikesCount': '$dislikesCount',
          'likesInfo.myStatus': {
            $let: {
              vars: {
                userLike: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$usersLikes',
                        as: 'like',
                        cond: { $eq: ['$$like.userId', userId] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: { $ifNull: ['$$userLike.likeStatus', 'None'] },
            },
          },
          'postInfo.id': '$post._id',
          'postInfo.title': '$post.title',
          'postInfo.blogId': '$post.blogId',
          'postInfo.blogName': '$post.blogName',
        },
      },
    ]);

    const result = await this._queryBuilder(query, comments);
    result.convert();

    return new ResultDTO(InternalCode.Success, result);
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

  async _queryBuilder(queryData, entity) {
    const sortBy = queryData.sortBy ?? 'createdAt';
    const sortDirection = queryData.sortDirection ?? 'desc';
    const pageNumber = queryData.pageNumber ? +queryData.pageNumber : 1;
    const pageSize = queryData.pageSize ? +queryData.pageSize : 10;
    const skip = pageSize * (pageNumber - 1);

    entity
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);
    const items = await entity;

    const pagesCount = Math.ceil(items.length / pageSize);

    return new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      items.length,
      items,
    );
  }
}
