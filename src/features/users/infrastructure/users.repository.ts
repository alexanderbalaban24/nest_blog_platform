import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId: string): Promise<ResultDTO<UserDocument>> {
    const userInstance = await this.UserModel.findById(userId);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async create(
    userInstance: UserDocument,
  ): Promise<ResultDTO<{ userId: string }>> {
    const createdInstance = await userInstance.save();
    return new ResultDTO(InternalCode.Success, {
      userId: createdInstance._id.toString(),
    });
  }

  async save(userInstance: UserDocument): Promise<ResultDTO<null>> {
    await userInstance.save();

    return new ResultDTO(InternalCode.Success);
  }
}
