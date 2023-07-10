import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { QueryCustomMethods } from '../../../shared/types';
import { queryHelper } from '../../../shared/helpers';

export type BlogDocument = HydratedDocument<Blog>;

type BlogStaticMethod = {
  makeInstance: (
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

type BlogInstanceMethodsType = {
  changeData(name: string, description: string, websiteUrl: string): void;
  bindUser(userId: string, userLogin: string): void;
};

export type BlogModelType = Model<
  BlogDocument,
  QueryCustomMethods,
  BlogInstanceMethodsType
> &
  BlogStaticMethod;

@Schema({ _id: false, versionKey: false })
class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class Blog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ default: false })
  isMembership: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: BlogOwnerInfo, required: true })
  blogOwnerInfo: BlogOwnerInfo;

  static makeInstance(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel({
      name,
      description,
      websiteUrl,
      blogOwnerInfo: { userId, userLogin },
    });
  }

  changeData(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }

  bindUser(userId: string, userLogin: string) {
    this.blogOwnerInfo = { userId, userLogin };
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

const blogStaticMethods: BlogStaticMethod = {
  makeInstance: Blog.makeInstance,
};
BlogSchema.statics = blogStaticMethods;

const blogInstancesMethod: BlogInstanceMethodsType = {
  changeData: Blog.prototype.changeData,
  bindUser: Blog.prototype.bindUser,
};
BlogSchema.methods = blogInstancesMethod;

BlogSchema.query = { findWithQuery: queryHelper.findWithQuery };
