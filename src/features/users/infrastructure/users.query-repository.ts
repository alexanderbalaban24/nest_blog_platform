import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { ViewUserModel } from '../api/models/view/ViewUserModel';
import { QueryParamsUserModel } from '../api/models/input/QueryParamsUserModel';
import { QueryBuildDTO } from '../../../shared/dto';
import { Types } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUsers(
    query: QueryParamsUserModel,
  ): Promise<QueryBuildDTO<User, ViewUserModel>> {
    const usersData = await this.UserModel.find({}).findWithQuery<
      User,
      ViewUserModel
    >(query);
    usersData.map(this._mapUserToView);

    return usersData;
  }

  async findUserById(userId: Types.ObjectId) {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) throw new NotFoundException();

    return this._mapUserToView(user);
  }

  _mapUserToView(user: UserDocument): ViewUserModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
