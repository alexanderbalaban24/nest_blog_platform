import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../users/domain/users.entity';
import { Types } from 'mongoose';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId: Types.ObjectId): Promise<UserDocument> {
    return this.UserModel.findById(userId);
  }

  async findByCredentials(loginOrEmail: string): Promise<UserDocument> {
    return this.UserModel.findOne().or([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
  }

  async save(user: UserDocument): Promise<boolean> {
    await user.save();
    return true;
  }
}
