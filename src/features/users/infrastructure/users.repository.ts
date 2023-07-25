import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(userId: string): Promise<ResultDTO<UserDocument>> {
    const userInstance = await this.UserModel.findById(userId);
    if (!userInstance) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, userInstance);
  }

  async checkUserAccessForBlog(
    userId: string,
    blogId: string,
  ): Promise<ResultDTO<boolean>> {
    const ban = await this.UserModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(userId) },
      },
      {
        $project: {
          _id: 0,
          isBanned: {
            $let: {
              vars: {
                userBanInfo: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$bannedBlogsInfo',
                        as: 'ban',
                        cond: { $eq: ['$$ban.blogId', blogId] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: { $ifNull: ['$$userBanInfo.isBanned', false] },
            },
          },
        },
      },
    ]);

    return new ResultDTO(InternalCode.Success, ban[0].isBanned);
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
