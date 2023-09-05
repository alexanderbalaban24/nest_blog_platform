import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InternalCode } from '../../../../shared/enums';
import { ResultDTO } from '../../../../shared/dto';
import { UserEmailConfirmation } from '../../entities/user-email-confirmation.entity';

@Injectable()
export class EmailConfirmationQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(UserEmailConfirmation)
    private emailConfirmRepo: Repository<UserEmailConfirmation>,
  ) {}

  async findConfirmationByCode(
    code: string,
  ): Promise<ResultDTO<UserEmailConfirmation>> {
    const res = await this.emailConfirmRepo.findOneBy({
      confirmationCode: code,
    });
    console.log(res);
    if (!res) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, res);
  }
}
