import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../users/domain/users.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId: string): Promise<ResultDTO<UserDocument>> {
    const userInstance = await this.UserModel.findById(userId);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async findByCredentials(
    loginOrEmail: string,
  ): Promise<ResultDTO<UserDocument>> {
    const userInstance = await this.UserModel.findOne().or([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
    if (!userInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async save(user: UserDocument): Promise<ResultDTO<null>> {
    await user.save();

    return new ResultDTO(InternalCode.Success);
  }
}
