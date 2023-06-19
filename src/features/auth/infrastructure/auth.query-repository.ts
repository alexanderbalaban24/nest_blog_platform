import {
  User,
  UserDocument,
  UserModelType,
} from '../../users/domain/users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

export class AuthQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserWithConfirmationDataById(userId: Types.ObjectId) {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) throw new NotFoundException();

    return {
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };
  }

  async findUserByCredentials(loginOrEmail: string): Promise<UserDocument> {
    return this.UserModel.findOne()
      .or([{ login: loginOrEmail }, { email: loginOrEmail }])
      .lean();
  }

  async findUserByConfirmationCode(code: string): Promise<Types.ObjectId> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecover.confirmationCode': code },
    ]);

    return user?._id;
  }
}
