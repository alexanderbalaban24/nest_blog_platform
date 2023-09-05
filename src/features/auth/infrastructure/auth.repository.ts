import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../shared/dto';
import { AuthAction, InternalCode } from '../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

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

  async findByCredentials(loginOrEmail: string): Promise<ResultDTO<User>> {
    const user = await this.usersRepo.findOne({
      relations: {
        ban: true,
        emailConfirm: true,
      },
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, user);
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
