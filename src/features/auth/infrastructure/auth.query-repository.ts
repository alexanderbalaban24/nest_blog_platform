import {
  EmailConfirmation,
  PasswordRecovery,
  User,
  UserDocument,
  UserModelType,
} from '../../users/domain/users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class AuthQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserWithConfirmationDataById(userId: Types.ObjectId) {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) return null;

    return {
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };
  }

  async findUserByConfirmationCode(code: string): Promise<Types.ObjectId> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecovery.confirmationCode': code },
    ]);

    return user?._id;
  }

  async findConfirmationOrRecoveryDataById(
    code: string,
  ): Promise<EmailConfirmation | PasswordRecovery> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecovery.confirmationCode': code },
    ]);
    return user.emailConfirmation.confirmationCode === code
      ? user.emailConfirmation
      : user.passwordRecovery;
  }
}
