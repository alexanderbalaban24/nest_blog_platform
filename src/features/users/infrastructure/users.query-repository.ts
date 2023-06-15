import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/users.entity';
import { ViewUserModel } from '../api/models/view/ViewUserModel';
import { QueryParamsUserModel } from '../api/models/input/QueryParamsUserModel';
import { QueryBuildDTO } from '../../../shared/dto';

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
    usersData.map(this._mapUserToViewUserModel);

    return usersData;
  }

  async findUserById(userId: string) {
    const user = await this.UserModel.findById(userId).lean();

    return this._mapUserToViewUserModel(user);
  }

  _mapUserToViewUserModel(user: User): ViewUserModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
