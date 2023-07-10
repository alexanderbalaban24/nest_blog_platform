import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/posts.entity';
import { ViewPostModel } from '../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode, LikeStatusEnum } from '../../../shared/enums';
import { UserLikeType } from '../../../shared/types';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
    userId?: string,
  ): Promise<ResultDTO<QueryBuildDTO<Post, ViewPostModel>>> {
    const postData = await this.PostModel.find({
      isDeactivate: { $ne: false },
    }).findWithQuery<Post, ViewPostModel>(query, blogId);
    postData.map((post) => this._mapPostToView(post, userId));

    return new ResultDTO(InternalCode.Success, postData);
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<ResultDTO<ViewPostModel>> {
    const post = await this.PostModel.findById(postId).lean();
    if (!post) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapPostToView(post, userId),
    );
  }

  _mapPostToView(post: Post, userId?: string): ViewPostModel {
    const userLikeData = post.usersLikes.find((item) => {
      if (!item.userId) return null;

      return item.userId === userId;
    });

    const newestLikes = post.usersLikes
      .sort((a, b) => Number(b.addedAt) - Number(a.addedAt))
      .filter(
        (item) => item.likeStatus === LikeStatusEnum.Like && !item.isDeactivate,
      )
      .map((item) => ({
        addedAt: item.addedAt,
        userId: item.userId,
        login: item.login,
      }))
      .slice(0, 3);
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: userLikeData?.likeStatus ?? LikeStatusEnum.None,
        newestLikes: newestLikes as UserLikeType[],
      },
    };
  }
}
