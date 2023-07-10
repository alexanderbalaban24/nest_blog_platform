import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { QueryCustomMethods } from '../../../shared/types';
import { queryHelper, reverseLikeStatus } from '../../../shared/helpers';
import { LikeStatusEnum } from '../../../shared/enums';

export type CommentDocument = HydratedDocument<Comment>;

type CommentStaticsMethodType = {
  makeInstance: (
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};

type CommentInstanceMethods = {
  updateData: (content: string, currentUserId: string) => void;
  deactivate: () => void;
  activate: () => void;
  deactivateLike: (userId: string) => void;
  activateLike: (userId: string) => void;
  like: (userId: string, likeStatus: LikeStatusEnum) => void;
};

export type CommentModelType = Model<
  CommentDocument,
  QueryCustomMethods,
  CommentInstanceMethods
> &
  CommentStaticsMethodType;

@Schema({ _id: false, versionKey: false })
class CommentatorInfo {
  @Prop({ require: true })
  userId: string;

  @Prop({ require: true })
  userLogin: string;
}

@Schema({ _id: false, versionKey: false })
class UserLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: LikeStatusEnum })
  likeStatus: LikeStatusEnum;

  @Prop({ default: false })
  isDeactivate: boolean;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({ require: true })
  postId: string;

  @Prop({ require: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  @Prop([UserLike])
  usersLikes: UserLike[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  isDeactivate: boolean;

  static makeInstance(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
  ): CommentDocument {
    const commentatorInfo = {
      userId,
      userLogin,
    };
    return new CommentModel({ postId, content, commentatorInfo });
  }

  updateData(content: string, currentUserId: string) {
    if (currentUserId !== this.commentatorInfo.userId)
      throw new Error('try edit the comment that is not your own');

    this.content = content;
  }

  deactivateLike(userId: string) {
    const ind = this.usersLikes.findIndex((like) => like.userId === userId);
    this.usersLikes[ind].isDeactivate = true;

    if (this.usersLikes[ind].likeStatus === LikeStatusEnum.Like) {
      --this.likesCount;
    } else {
      --this.dislikesCount;
    }
  }

  activateLike(userId: string) {
    const ind = this.usersLikes.findIndex((like) => like.userId === userId);
    this.usersLikes[ind].isDeactivate = false;

    if (this.usersLikes[ind].likeStatus === LikeStatusEnum.Like) {
      ++this.likesCount;
    } else {
      ++this.dislikesCount;
    }
  }

  deactivate() {
    this.isDeactivate = true;
  }

  activate() {
    this.isDeactivate = false;
  }

  like(userId: string, likeStatus: LikeStatusEnum) {
    const ind = this.usersLikes.findIndex(
      (like: UserLike) => like.userId === userId,
    );

    if (ind === -1) {
      const newLike = { userId, likeStatus, isDeactivate: false };

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

export const CommentSchema = SchemaFactory.createForClass(Comment);

const commentStaticsMethod: CommentStaticsMethodType = {
  makeInstance: Comment.makeInstance,
};
CommentSchema.statics = commentStaticsMethod;

CommentSchema.query = { findWithQuery: queryHelper.findWithQuery };

const commentInstanceMethods: CommentInstanceMethods = {
  updateData: Comment.prototype.updateData,
  deactivate: Comment.prototype.deactivate,
  activate: Comment.prototype.activate,
  deactivateLike: Comment.prototype.deactivateLike,
  activateLike: Comment.prototype.activateLike,
  like: Comment.prototype.like,
};
CommentSchema.methods = commentInstanceMethods;
