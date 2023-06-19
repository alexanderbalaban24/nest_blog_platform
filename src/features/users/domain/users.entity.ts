import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { QueryCustomMethods } from '../../../shared/types';
import { queryHelper } from '../../../shared/helpers';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

type UserStaticMethodType = {
  makeInstance: (
    login: string,
    email: string,
    passwordHash: string,
    isConfirmed: boolean,
    UserModel: UserModelType,
  ) => UserDocument;
};

type UserInstanceMethodType = {
  confirmAccount: () => void;
  updateConfirmationData: () => string;
};

export type UserModelType = Model<
  UserDocument,
  QueryCustomMethods,
  UserInstanceMethodType
> &
  UserStaticMethodType;

@Schema({ _id: false, versionKey: false })
export class EmailConfirmation {
  @Prop({ default: uuidv4() })
  confirmationCode: string;
  @Prop({ default: add(new Date(), { hours: 3 }) })
  expirationDate: Date;
  @Prop({ default: false })
  isConfirmed: boolean;
}

// TODO в схему сразу ниже можно записать timestamp
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

  @Prop({ type: EmailConfirmation, default: new EmailConfirmation() })
  emailConfirmation: EmailConfirmation;

  static makeInstance(
    login: string,
    email: string,
    passwordHash: string,
    isConfirmed: boolean,
    UserModel: UserModelType,
  ): UserDocument {
    const newUser = new UserModel({ login, email, passwordHash });
    newUser.emailConfirmation.isConfirmed = isConfirmed;

    return newUser;
  }

  updateConfirmationData(): string {
    const code = uuidv4();
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 3 });

    return code;
  }

  confirmAccount() {
    this.emailConfirmation.isConfirmed = true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethod: UserStaticMethodType = {
  makeInstance: User.makeInstance,
};
UserSchema.statics = userStaticMethod;

const userInstanceMethod: UserInstanceMethodType = {
  confirmAccount: User.prototype.confirmAccount,
  updateConfirmationData: User.prototype.updateConfirmationData,
};
UserSchema.methods = userInstanceMethod;

UserSchema.query = { findWithQuery: queryHelper.findWithQuery };
