import {
  EmailConfirmation,
  PasswordRecovery,
  User,
  UserModelType,
} from '../../users/domain/users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

export class AuthQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserWithConfirmationDataById(userId: string): Promise<
    ResultDTO<{
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    }>
  > {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) return new ResultDTO(InternalCode.NotFound);

    const result = {
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };

    return new ResultDTO(InternalCode.Success, result);
  }

  async findMe(
    userId: string,
  ): Promise<ResultDTO<{ email: string; login: string; userId: string }>> {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) return new ResultDTO(InternalCode.Unauthorized);

    const userData = {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };

    return new ResultDTO(InternalCode.Success, userData);
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<ResultDTO<{ userId: string }>> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecovery.confirmationCode': code },
    ]);
    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, { userId: user._id.toString() });
  }

  async findConfirmationOrRecoveryDataById(
    code: string,
  ): Promise<ResultDTO<EmailConfirmation | PasswordRecovery>> {
    const user = await this.UserModel.findOne().or([
      { 'emailConfirmation.confirmationCode': code },
      { 'passwordRecovery.confirmationCode': code },
    ]);
    if (!user) return new ResultDTO(InternalCode.NotFound);

    const confirmOrRecovery =
      user.emailConfirmation.confirmationCode === code
        ? user.emailConfirmation
        : user.passwordRecovery;

    return new ResultDTO(InternalCode.Success, confirmOrRecovery);
  }
}
