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

  async findUserWithConfirmationDataById(userId: string) {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) return null;

    return {
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };
  }

  async findMe(userId: string) {
    const user = await this.UserModel.findById(userId).lean();

    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }

  async findUserByConfirmationCode(code: string): Promise<string> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecovery.confirmationCode': code },
    ]);

    return user._id.toString();
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
