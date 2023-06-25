import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId: string): Promise<UserDocument> {
    return this.UserModel.findById(userId);
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
