import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async createUser(
    login: string,
    email: string,
    passwordHash: string,
    isConfirmed: boolean,
    expirationDate: Date,
  ): Promise<ResultDTO<{ userId: string }>> {
    const res = await this.dataSource.query<{ userId: string }[]>(
      `
      WITH "user_temp" AS (
    INSERT INTO "users" AS u
    ("login", "email", "passwordHash")
    VALUES($1, $2, $3)
    RETURNING "id" AS "userId"
    ),
    "user_confirm_temp" AS (
    INSERT INTO "users_email_confirmation"
    ("userId", "expirationDate", "isConfirmed")
    VALUES((SELECT "userId" from "user_temp"), $4, $5)
    RETURNING "userId"
    )
    INSERT INTO "users_ban" AS ub
    ("userId", "isBanned")
    VALUES((SELECT "userId" from "user_confirm_temp"), $6)
    RETURNING "userId"
    `,
      [login, email, passwordHash, expirationDate, isConfirmed, false],
    );
    return new ResultDTO(InternalCode.Success, res[0]);
  }

  async deleteById(userId: string): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    DELETE FROM "users_email_confirmation" as uec
    WHERE uec."userId" = $1  
    `,
      [userId],
    );

    await this.dataSource.query(
      `
    DELETE FROM "users_ban" as uec
    WHERE uec."userId" = $1  
    `,
      [userId],
    );

    await this.dataSource.query(
      `
    DELETE FROM "users_password_recovery" as uec
    WHERE uec."userId" = $1  
    `,
      [userId],
    );

    await this.dataSource.query(
      `
    DELETE FROM "users" AS u
    WHERE u."id" = $1
    `,
      [userId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async findById(userId: string): Promise<ResultDTO<any>> {
    const users = await this.dataSource.query(
      `
    SELECT u.*, ub."isBanned", ub."banDate", ub."banReason"
    FROM "users" as u
    LEFT JOIN "users_ban" as ub
    ON ub."userId" = u."id"
    WHERE u."id" = $1
    `,
      [userId],
    );
    if (!users.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, users[0]);
  }

  async banUser(
    userId: string,
    isBanned: boolean,
    banReason: string,
    banDate: Date,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
     UPDATE "users_ban" as ub
     SET "isBanned" = $2, "banReason" = $3, "banDate" = $4
     WHERE ub."userId" = $1
      `,
      [userId, isBanned, banReason, banDate],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async banUserForSpecificBlog(
    userId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<ResultDTO<null>> {
    if (isBanned) {
      await this.dataSource.query(
        `
    INSERT INTO "users_ban_for_blog" as ub
    ("userId", "banReason", "blogId")
    VALUES($1, $2, $3)
    `,
        [userId, banReason, blogId],
      );
    } else {
      await this.dataSource.query(
        `
      DELETE FROM "users_ban_for_blog" as ub
      WHERE ab."userId" = $1 AND
      ab."blogId" = $2
      `,
        [userId, blogId],
      );
    }

    return new ResultDTO(InternalCode.Success);
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
