import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { UserBan } from '../../entities/user-ban.entity';

@Injectable()
export class BansRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(UserBan) private bansRepo: Repository<UserBan>,
  ) {}

  /*async create(ban: UserBan): Promise<ResultDTO<{ userId: string }>> {
    const res = await this.bansRepo.save(ban);

    return new ResultDTO(InternalCode.Success, { userId: res.id.toString() });
  }*/

  async save(ban: UserBan): Promise<ResultDTO<null>> {
    await this.bansRepo.save(ban);

    return new ResultDTO(InternalCode.Success);
  }
}
