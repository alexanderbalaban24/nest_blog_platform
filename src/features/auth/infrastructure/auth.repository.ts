import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { AuthAction, InternalCode } from '../../../shared/enums';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findByConfirmationCode(
    code: string,
    action: AuthAction,
  ): Promise<ResultDTO<{ userId: string }>> {
    const users = await this.dataSource.query<{ userId: string }[]>(
      `
    SELECT uc."userId"
    FROM ${action} as uc
    WHERE uc."confirmationCode" = $1
    `,
      [code],
    );
    if (!users.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, users[0]);
  }

  async findByCredentials(loginOrEmail: string): Promise<ResultDTO<any>> {
    const users = await this.dataSource.query(
      `
    SELECT u.*, ub."isBanned", uec."isConfirmed"
    FROM "users" as u
    LEFT JOIN "users_ban" as ub
    ON ub."userId" = u."id"
    LEFT JOIN "users_email_confirmation" as uec
    ON uec."userId" = u."id"
    WHERE u."login" = $1
    OR u."email" = $1
    `,
      [loginOrEmail],
    );
    if (!users.length) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, users[0]);
  }

  async confirmEmail(userId: string): Promise<ResultDTO<null>> {
    const res = await this.dataSource.query(
      `
    UPDATE "users_email_confirmation" as uec
    SET "isConfirmed" = true
    WHERE uec."userId" = $1
    `,
      [userId],
    );
    console.log('ConfirmEmail', res);

    return new ResultDTO(InternalCode.Success);
  }

  async createPasswordRecoveryData(
    userId: string,
    confirmationCode: string,
    expirationDate: Date,
  ): Promise<ResultDTO<{ confirmationCode: string }>> {
    const res = await this.dataSource.query(
      `
    INSERT INTO "users_password_recovery" as upr
    ("userId", "confirmationCode", "expirationDate")
    VALUES($1, $2, $3)
    RETURNING "confirmationCode"
    `,
      [userId, confirmationCode, expirationDate],
    );

    return new ResultDTO(InternalCode.Success, res[0]);
  }

  async updatePasswordHash(
    userId: string,
    newPasswordHash: string,
  ): Promise<ResultDTO<null>> {
    await this.dataSource.query(
      `
    UPDATE "users"
    SET "passwordHash" = $1
    WHERE "id" = $2
    `,
      [newPasswordHash, userId],
    );

    await this.dataSource.query(
      `
    UPDATE "users_password_recovery"
    SET "isConfirmed" = true
    WHERE "userId" = $1
    `,
      [userId],
    );

    return new ResultDTO(InternalCode.Success);
  }

  async updateConfirmationOrRecoveryData(
    email: string,
    code: string,
    newExpirationDate: Date,
    action: AuthAction,
  ): Promise<ResultDTO<{ confirmationCode: string }>> {
    const users = await this.dataSource.query(
      `
    UPDATE ${action}
    SET "confirmationCode" = $1,
    "expirationDate" = $2
    WHERE "userId" = (SELECT "id" FROM "users" AS u WHERE u."email" = $3)
    RETURNING "confirmationCode"
    `,
      [code, newExpirationDate, email],
    );
    if (!users.length) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success, users[0][0]);
  }
}
