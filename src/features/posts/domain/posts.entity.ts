import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { queryHelper, reverseLikeStatus } from '../../../shared/helpers';
import { QueryCustomMethods } from '../../../shared/types';
import { LikeStatusEnum } from '../../../shared/enums';

export type PostDocument = HydratedDocument<Post>;

type PostStaticMethod = {
  makeInstance: (
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    PostModel: PostModelType,
  ) => PostDocument;
};

type PostInstanceMethodType = {
  changeData(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ): void;
  like: (userId: string, userLogin: string, likeStatus: LikeStatusEnum) => void;
};

export type PostModelType = Model<
  PostDocument,
  QueryCustomMethods,
  PostInstanceMethodType
> &
  PostStaticMethod;

@Schema()
class UserLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
  @Prop({ required: true, enum: LikeStatusEnum })
  likeStatus: LikeStatusEnum;
  @Prop({ required: true, type: Date })
  addedAt: Date;
}

@Schema()
export class Post {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  @Prop([UserLike])
  usersLikes: UserLike[];

  static makeInstance(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    PostModel: PostModelType,
  ) {
    return new PostModel({
      title,
      shortDescription,
      content,
      blogId,
      blogName,
    });
  }

  changeData(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
  }

  like(userId: string, userLogin: string, likeStatus: LikeStatusEnum) {
    const ind: number = this.usersLikes.findIndex(
      (like) => like.userId === userId,
    );
    const isLikeExist = ind === -1;

    if (isLikeExist) {
      const newLike = {
        userId,
        login: userLogin,
        likeStatus,
        addedAt: new Date(),
      };

      if (likeStatus !== LikeStatusEnum.None) {
        if (likeStatus === LikeStatusEnum.Like) this.likesCount++;
        else this.dislikesCount++;
      }

      this.usersLikes.push(newLike);
      return;
    }

    const myLike: UserLike = this.usersLikes[ind];
    if (likeStatus === myLike.likeStatus) {
      return;
    }

    if (
      myLike.likeStatus !== LikeStatusEnum.None &&
      likeStatus !== LikeStatusEnum.None
    ) {
      myLike.likeStatus = reverseLikeStatus(myLike.likeStatus);

      if (likeStatus === LikeStatusEnum.Like) {
        this.likesCount++;
        this.dislikesCount--;
      } else {
        this.dislikesCount++;
        this.likesCount--;
      }

      return;
    }

    myLike.likeStatus = likeStatus;

    if (myLike.likeStatus === LikeStatusEnum.Like) this.likesCount--;
    else this.dislikesCount--;

    return;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

const postStaticMethods: PostStaticMethod = {
  makeInstance: Post.makeInstance,
};
PostSchema.statics = postStaticMethods;

const postInstanceMethod: PostInstanceMethodType = {
  changeData: Post.prototype.changeData,
  like: Post.prototype.like,
};
PostSchema.methods = postInstanceMethod;

PostSchema.query = { findWithQuery: queryHelper.findWithQuery };
