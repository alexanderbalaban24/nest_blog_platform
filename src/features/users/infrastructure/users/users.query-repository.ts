import { Injectable } from '@nestjs/common';
import { ViewUserModel } from '../../api/models/view/ViewUserModel';
import { QueryParamsUserModel } from '../../api/models/input/QueryParamsUserModel';
import { QueryBuildDTO, ResultDTO } from '../../../../shared/dto';
import { BanStatus, InternalCode } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOneOptions,
  FindOperator,
  FindOptions,
  ILike,
  Repository,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserBan } from '../../entities/user-ban.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async findUsers(
    query: QueryParamsUserModel,
  ): Promise<ResultDTO<QueryBuildDTO<any, ViewUserModel>>> {
    //const banStatus = query.banStatus ?? BanStatus.All;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const offset = pageSize * (pageNumber - 1);
    const queryData: Array<{
      login?: FindOperator<string>;
      email?: FindOperator<string>;
    }> = [];

    if (query.searchLoginTerm) {
      queryData.push({ login: ILike(`%${query.searchLoginTerm}%`) });
    }

    if (query.searchEmailTerm) {
      queryData.push({ email: ILike(`%${query.searchEmailTerm}%`) });
    }
    console.log(queryData);
    const users = await this.usersRepo.findAndCount({
      where: queryData,
      order: { [`LOWER(${sortBy})`]: sortDirection },
      skip: offset,
      take: pageSize,
      relations: {
        ban: true,
      },
    });

    const totalCount = +users[1];
    const pagesCount = Math.ceil(totalCount / pageSize);
    const data = new QueryBuildDTO<any, any>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      users[0],
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
    const user = await this.usersRepo.findOne({
      where: { id: +userId },
    });
    return new ResultDTO(InternalCode.Success, this._mapUserToView(user));
  }

  _mapUserToView(user): ViewUserModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
      /*banInfo: {
        isBanned: user.ban?.isBanned ?? null,
        banDate: user.ban?.banDate ?? null,
        banReason: user.ban?.banReason ?? null,
      },*/
    };
  }
}
