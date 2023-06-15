import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/posts.entity';
import { ViewPostModel } from '../api/models/view/ViewPostModel';
import { QueryParamsPostModel } from '../api/models/input/QueryParamsPostModel';
import { QueryBuildDTO } from '../../../shared/dto';
import { LikeStatusEnum } from '../../../shared/enums';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findPosts(
    query: QueryParamsPostModel,
    blogId?: string,
  ): Promise<QueryBuildDTO<Post, ViewPostModel>> {
    const postData = await this.PostModel.find({}).findWithQuery<
      Post,
      ViewPostModel
    >(query, blogId);
    postData.map(this._mapPostDBToViewPostModel);

    return postData;
  }

  async findPostById(postId: string): Promise<ViewPostModel> {
    const post = await this.PostModel.findById(postId).lean();

    return this._mapPostDBToViewPostModel(post);
  }

  _mapPostDBToViewPostModel(post: Post): ViewPostModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
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
