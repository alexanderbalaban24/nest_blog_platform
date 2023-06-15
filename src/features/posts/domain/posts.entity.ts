import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { queryHelper } from '../../../shared/helpers';
import { QueryCustomMethods, UserLikeType } from '../../../shared/types';

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
};

export type PostModelType = Model<
  PostDocument,
  QueryCustomMethods,
  PostInstanceMethodType
> &
  PostStaticMethod;

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

  @Prop({ default: [] })
  usersLikes: UserLikeType[];

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
}

export const PostSchema = SchemaFactory.createForClass(Post);

const postStaticMethods: PostStaticMethod = {
  makeInstance: Post.makeInstance,
};
PostSchema.statics = postStaticMethods;

const postInstanceMethod: PostInstanceMethodType = {
  changeData: Post.prototype.changeData,
};
PostSchema.methods = postInstanceMethod;

PostSchema.query = { findWithQuery: queryHelper.findWithQuery };
