import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { ViewPostModel } from '../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO } from '../../../shared/dto';
import { LikeStatusEnum } from '../../../shared/enums';
import { Types } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: Types.ObjectId,
  ): Promise<QueryBuildDTO<Post, ViewPostModel>> {
    const postData = await this.PostModel.find({}).findWithQuery<
      Post,
      ViewPostModel
    >(query, blogId);
    postData.map(this._mapPostToView);

    return postData;
  }

  async findPostById(postId: Types.ObjectId): Promise<ViewPostModel | null> {
    const post = await this.PostModel.findById(postId).lean();
    if (!post) return null;

    return this._mapPostToView(post);
  }

  _mapPostToView(post: PostDocument): ViewPostModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
    };
  }
}
