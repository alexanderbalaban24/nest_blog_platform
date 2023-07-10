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

type UserInstanceMethodsType = {
  confirmAccount: () => void;
  updatePasswordHash: (newPassHash: string) => void;
  updateConfirmationOrRecoveryData: (field: string) => string;
  banUser: (isBanned: boolean, banReason: string) => void;
};

export type UserModelType = Model<
  UserDocument,
  QueryCustomMethods,
  UserInstanceMethodsType
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

@Schema({ _id: false, versionKey: false })
export class PasswordRecovery {
  @Prop({ default: uuidv4() })
  confirmationCode: string;
  @Prop({ default: new Date() })
  expirationDate: Date;
  @Prop({ default: false })
  isConfirmed: boolean;
}

@Schema({ _id: false, versionKey: false })
export class BanUserInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop({ default: null })
  banDate: Date;
  @Prop({ default: null })
  banReason: string;
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

  @Prop({ type: PasswordRecovery, default: new PasswordRecovery() })
  passwordRecovery: PasswordRecovery;

  @Prop({ type: BanUserInfo, default: new BanUserInfo() })
  banInfo: BanUserInfo;

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

  updateConfirmationOrRecoveryData(field: string): string {
    if (!(field in this))
      throw new Error(
        'Incorrect field for data updating confirmation email or recovery password',
      );

    const code = uuidv4();
    this[field].confirmationCode = code;
    this[field].expirationDate = add(new Date(), { hours: 3 });

    return code;
  }

  confirmAccount() {
    this.emailConfirmation.isConfirmed = true;
  }

  updatePasswordHash(newPassHash: string) {
    this.passwordHash = newPassHash;
    this.passwordRecovery.isConfirmed = true;
  }

  banUser(isBanned: boolean, banReason: string) {
    this.banInfo.isBanned = isBanned;
    if (isBanned) {
      this.banInfo.banReason = banReason;
      this.banInfo.banDate = new Date();
    } else {
      this.banInfo.banReason = null;
      this.banInfo.banDate = null;
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethod: UserStaticMethodType = {
  makeInstance: User.makeInstance,
};
UserSchema.statics = userStaticMethod;

const userInstanceMethod: UserInstanceMethodsType = {
  confirmAccount: User.prototype.confirmAccount,
  updateConfirmationOrRecoveryData:
    User.prototype.updateConfirmationOrRecoveryData,
  updatePasswordHash: User.prototype.updatePasswordHash,
  banUser: User.prototype.banUser,
};
UserSchema.methods = userInstanceMethod;

UserSchema.query = { findWithQuery: queryHelper.findWithQuery };
