import { ResultDTO } from '../../../shared/dto';
import { AuthAction, InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class AuthQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserWithConfirmationDataById(userId: string): Promise<
    ResultDTO<{
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    }>
  > {
    const users = await this.dataSource.query(
      `
    SELECT uec."confirmationCode", uec."expirationDate", uec."isConfirmed"
    FROM "users_email_confirmation" as uec
    WHERE uec."userId" = $1
    `,
      [userId],
    );

    if (!users.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, users[0]);
  }

  async findMe(
    userId: string,
  ): Promise<ResultDTO<{ email: string; login: string; userId: string }>> {
    const usersRaw = await this.dataSource.query(
      `
    SELECT u."email", u."login", u."id" as "userId"
    FROM "users" as u
    WHERE u."id" = $1
    `,
      [userId],
    );
    if (!usersRaw.length) return new ResultDTO(InternalCode.Unauthorized);

    const data = {
      userId: usersRaw[0].userId.toString(),
      email: usersRaw[0].email,
      login: usersRaw[0].login,
    };

    return new ResultDTO(InternalCode.Success, data);
  }

  async findConfirmationOrRecoveryDataByCode(
    code: string,
    action: AuthAction,
  ): Promise<
    ResultDTO<{
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    }>
  > {
    const users = await this.dataSource.query(
      `
    SELECT uc."confirmationCode", uc."expirationDate", uc."isConfirmed"
    FROM ${action} as uc
    WHERE uc."confirmationCode" = $1
    `,
      [code],
    );

    if (!users.length) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success, users[0]);
  }
}
