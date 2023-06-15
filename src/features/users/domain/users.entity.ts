import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import { QueryCustomMethods } from '../../../shared/types';
import { queryHelper } from '../../../shared/helpers';

export type UserDocument = HydratedDocument<User>;

type UserStaticMethodType = {
  makeInstance: (
    login: string,
    email: string,
    password: string,
    UserModel: UserModelType,
  ) => Promise<UserDocument>;
};

export type UserModelType = Model<UserDocument, QueryCustomMethods> &
  UserStaticMethodType;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  static async makeInstance(
    login: string,
    email: string,
    password: string,
    UserModel: UserModelType,
  ): Promise<UserDocument> {
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(password, passwordSalt);

    return new UserModel({ login, email, passwordHash });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethod: UserStaticMethodType = {
  makeInstance: User.makeInstance,
};
UserSchema.statics = userStaticMethod;

UserSchema.query = { findWithQuery: queryHelper.findWithQuery };
