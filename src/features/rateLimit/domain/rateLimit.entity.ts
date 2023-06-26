import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type RateLimitDocument = HydratedDocument<RateLimit>;

type RateLimitStaticMethods = {
  makeInstance: (
    ip: string,
    url: string,
    RateLimitModel: RateLimitModelType,
  ) => RateLimitDocument;
};

export type RateLimitModelType = Model<RateLimitDocument> &
  RateLimitStaticMethods;

@Schema()
export class RateLimit {
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  url: string;
  @Prop({ default: Date.now })
  date: Date;

  static makeInstance(
    ip: string,
    url: string,
    RateLimitModel: RateLimitModelType,
  ): RateLimitDocument {
    return new RateLimitModel({ ip, url });
  }
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);

const rateLimitStaticMethod: RateLimitStaticMethods = {
  makeInstance: RateLimit.makeInstance,
};
RateLimitSchema.statics = rateLimitStaticMethod;
