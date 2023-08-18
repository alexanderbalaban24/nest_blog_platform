import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/users.entity';
import { ViewUserModel } from '../api/models/view/ViewUserModel';
import { QueryParamsUserModel } from '../api/models/input/QueryParamsUserModel';
import { QueryBuildDTO, ResultDTO } from '../../../shared/dto';
import { BanStatus, InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findUsers(
    query: QueryParamsUserModel,
  ): Promise<ResultDTO<QueryBuildDTO<User, ViewUserModel>>> {
    const banStatus = query.banStatus ?? BanStatus.All;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchLoginTerm = `%${query.searchLoginTerm ?? ''}%`;
    const searchEmailTerm = `%${query.searchEmailTerm ?? ''}%`;

    const usersRow = await this.dataSource.query(
      `
     WITH temp_data as (SELECT u.*, ub."isBanned", ub."banDate", ub."banReason"  
    FROM "users" as u
    LEFT JOIN "users_ban" as ub
    ON ub."userId" = u."id"
    WHERE ub."isBanned" = CASE 
    WHEN $1 = '${BanStatus.Banned}' THEN true
    WHEN $1 = '${BanStatus.NotBanned}' THEN false
    ELSE ub."isBanned" END AND
    (CASE WHEN u."login" ILIKE $2 THEN true 
    ELSE u."email" ILIKE $3 END)
    ),
    temp_data1 as (
    SELECT * FROM "temp_data" as td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT (
    SELECT COUNT(*)
    FROM temp_data
    ) as "totalCount",
    (SELECT json_agg(
    json_build_object(
    'id', td."id", 'login', td."login", 'email', td."email", 'createdAt', td."createdAt", 
    'banInfo', json_build_object(
    'isBanned', td."isBanned", 'banDate', td."banDate", 'banReason', td."banReason"
    )
    )
    ) FROM temp_data1 as td) as "json_data"
    `,
      [banStatus, searchLoginTerm, searchEmailTerm],
    );

    const totalCount = +usersRow[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      usersRow[0].json_data ?? [],
    );

    data.map((user) => this._mapUserToView(user));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findBannedUsersForBlog(query: QueryParamsUserModel, blogId: string) {
    const banStatus = query.banStatus ?? BanStatus.All;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const searchLoginTerm = `%${query.searchLoginTerm ?? ''}%`;
    const searchEmailTerm = `%${query.searchEmailTerm ?? ''}%`;

    const usersRaw = await this.dataSource.query(
      `
    WITH "temp_data1" AS (
    SELECT u."id", u."login", ub."isBanned", ub."banDate", ub."banReason", u."createdAt"
    FROM "users_ban_for_blog" AS ub
    LEFT JOIN "users" AS u
    ON u."id" = ub."userId"
    WHERE ub."blogId" = $4 AND
    ub."isBanned" = CASE 
    WHEN $1 = '${BanStatus.Banned}' THEN true
    WHEN $1 = '${BanStatus.NotBanned}' THEN false
    ELSE ub."isBanned" END AND
    (CASE WHEN u."login" ILIKE $2 THEN true 
    ELSE u."email" ILIKE $3 END)
    ),
    "temp_data2" AS (
    SELECT * FROM "temp_data1" as td
    ORDER BY "${sortBy}" ${
        sortBy !== 'createdAt' ? 'COLLATE "C" ' : ''
      } ${sortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT (
    SELECT COUNT(*)
    FROM "temp_data1"
    ) AS "totalCount",
    (SELECT json_agg(
    json_build_object(
    'id', td."id", 'login', td."login", 
    'banInfo', json_build_object(
    'isBanned', td."isBanned", 'banDate', td."banDate", 'banReason', td."banReason"
    )
    )
    ) FROM "temp_data2" AS td) AS "data"
    `,
      [banStatus, searchLoginTerm, searchEmailTerm, blogId],
    );

    const totalCount = +usersRaw[0].totalCount;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      usersRaw[0].data ?? [],
    );

    data.map((user) => ({
      id: user.id.toString(),
      login: user.login,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: new Date(user.banInfo.banDate).toISOString(),
        banReason: user.banInfo.banReason,
      },
    }));
    return new ResultDTO(InternalCode.Success, data);
  }

  async findUserById(userId: string): Promise<ResultDTO<ViewUserModel>> {
    const users = await this.dataSource.query(
      `
    SELECT json_agg(
    json_build_object(
    'id', u."id", 'login', u."login", 'email', u."email", 'createdAt', u."createdAt", 
    'banInfo', json_build_object(
    'isBanned', ub."isBanned", 'banDate', ub."banDate", 'banReason', ub."banReason"
    )
    )
    )  
    FROM "users" as u
    LEFT JOIN "users_ban" as ub
    ON ub."userId" = u."id"
    WHERE u."id" = $1
    `,
      [userId],
    );
    if (!users[0].json_agg.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(
      InternalCode.Success,
      this._mapUserToView(users[0].json_agg[0]),
    );
  }

  _mapUserToView(user): ViewUserModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate
          ? new Date(user.banInfo.banDate).toISOString()
          : user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }
}
