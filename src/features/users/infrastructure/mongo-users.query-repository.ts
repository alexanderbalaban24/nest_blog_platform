import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { ViewUserModel } from '../api/models/view/ViewUserModel';
import { QueryParamsUserModel } from '../api/models/input/QueryParamsUserModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

/*
{
      "id": "string",
      "content": "string",
      "commentatorInfo": {
        "userId": "string",
        "userLogin": "string"
      },
      "createdAt": "2023-08-17T22:28:06.819Z",
      "likesInfo": {
        "likesCount": 0,
        "dislikesCount": 0,
        "myStatus": "None"
      },
      "postInfo": {
        "id": "string",
        "title": "string",
        "blogId": "string",
        "blogName": "string"
      }
    }

    {
        "id": 4,
        "content": "My First comment test",
        "userId": 1135,
        "userLogin": "Alex",
        "createdAt": "2023-08-17T14:36:10.951Z",
        "postId": 131,
        "title": "Test CP",
        "blogId": 682,
        "blogName": "Tim",
        "likesCount": 2,
        "dislikesCount": 0,
        "myStatus": "Like"
    }
*/

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUsers(
    query: QueryParamsUserModel,
  ): Promise<ResultDTO<QueryBuildDTO<User, ViewUserModel>>> {
    const usersData = await this.UserModel.find({}).findWithQuery<
      User,
      ViewUserModel
    >(query);
    usersData.map(this._mapUserToView);

    return new ResultDTO(InternalCode.Success, usersData);
  }

  async findBannedUsersForBlog(query: QueryParamsUserModel, blogId: string) {
    const usersData = await this.UserModel.find({
      'bannedBlogsInfo.blogId': blogId,
      'bannedBlogsInfo.isBanned': { $ne: false },
    }).findWithQuery(query);
    usersData.map((user: UserDocument) => {
      const banInfo = user.bannedBlogsInfo.find(
        (banData) => banData.blogId === blogId,
      );

      return {
        id: user._id.toString(),
        login: user.login,
        banInfo: {
          isBanned: banInfo.isBanned,
          banDate: banInfo.banDate,
          banReason: banInfo.banReason,
        },
      };
    });

    return new ResultDTO(InternalCode.Success, usersData);
  }

  async findUserById(userId: string): Promise<ResultDTO<ViewUserModel>> {
    const user = await this.UserModel.findById(userId).lean();
    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, this._mapUserToView(user));
  }

  _mapUserToView(user: UserDocument): ViewUserModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      banInfo: user.banInfo,
    };
  }
}
