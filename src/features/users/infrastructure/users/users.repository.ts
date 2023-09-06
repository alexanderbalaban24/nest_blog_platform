import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(user: User): Promise<ResultDTO<{ userId: string }>> {
    const res = await this.usersRepo.save(user);

    return new ResultDTO(InternalCode.Success, { userId: res.id.toString() });
  }

  async save(user: User): Promise<ResultDTO<null>> {
    await this.usersRepo.save(user);

    return new ResultDTO(InternalCode.Success);
  }

  async deleteById(userId: string): Promise<ResultDTO<null>> {
    const res = await this.usersRepo.delete(userId);
    /*await this.dataSource.query(
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
    );*/
    if (res.affected !== 1) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success);
  }

  async findById(userId: number): Promise<ResultDTO<User>> {
    const user = await this.usersRepo.findOne({
      relations: {
        ban: true,
      },
      where: { id: +userId },
    });

    if (!user) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, user);
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

  /*async banUser(
    userId: string,
    isBanned: boolean,
    banReason: string,
    banDate: Date,
  ): Promise<ResultDTO<null>> {
    await this.usersRepo.upsert();

    return new ResultDTO(InternalCode.Success);
  }*/
  /*async banUser(
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
  }*/

  async banUserForSpecificBlog(
    userId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<ResultDTO<null>> {
    if (isBanned) {
      await this.dataSource.query(
        `
    INSERT INTO "users_ban_for_blog" AS ub
    ("userId", "banReason", "blogId")
    VALUES($1, $2, $3)
    `,
        [userId, banReason, blogId],
      );
    } else {
      await this.dataSource.query(
        `
      DELETE FROM "users_ban_for_blog" AS ub
      WHERE ub."userId" = $1 AND
      ub."blogId" = $2
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
    const banRaw = await this.dataSource.query(
      `
    SELECT ub."isBanned" 
    FROM "users_ban_for_blog" AS ub
    WHERE ub."blogId" = $1 AND
    ub."userId" = $2
    `,
      [blogId, userId],
    );
    console.log(banRaw);
    const access = !banRaw.length || !banRaw[0].isBanned;
    console.log(access);
    return new ResultDTO(InternalCode.Success, access);
  }
}
