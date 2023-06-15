import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId): Promise<UserDocument> {
    const userInstance = this.UserModel.findById(userId);
    if (!userInstance) throw new NotFoundException();

    return userInstance;
  }

  async create(userInstance: UserDocument): Promise<string> {
    const createdInstance = await userInstance.save();

    return createdInstance._id.toString();
  }

  async save(userInstance: UserDocument): Promise<boolean> {
    await userInstance.save();

    return true;
  }
}
