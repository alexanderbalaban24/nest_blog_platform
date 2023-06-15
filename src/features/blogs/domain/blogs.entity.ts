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
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

type BlogInstanceMethodType = {
  changeData(name: string, description: string, websiteUrl: string): void;
};

export type BlogModelType = Model<
  BlogDocument,
  QueryCustomMethods,
  BlogInstanceMethodType
> &
  BlogStaticMethod;

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

  static makeInstance(
    name: string,
    description: string,
    websiteUrl: string,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel({ name, description, websiteUrl });
  }

  changeData(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

const blogStaticMethods: BlogStaticMethod = {
  makeInstance: Blog.makeInstance,
};
BlogSchema.statics = blogStaticMethods;

const blogInstanceMethod: BlogInstanceMethodType = {
  changeData: Blog.prototype.changeData,
};
BlogSchema.methods = blogInstanceMethod;

BlogSchema.query = { findWithQuery: queryHelper.findWithQuery };
