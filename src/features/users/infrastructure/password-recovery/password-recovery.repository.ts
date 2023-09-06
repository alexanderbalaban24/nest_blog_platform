import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ResultDTO } from '../../../../shared/dto';
import { AuthAction, InternalCode } from '../../../../shared/enums';
import { UserEmailConfirmation } from '../../entities/user-email-confirmation.entity';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(UserEmailConfirmation)
    private emailConfirmRepo: Repository<UserEmailConfirmation>,
  ) {}

  async create(
    emailConfirmData: UserEmailConfirmation,
  ): Promise<ResultDTO<{ confirmationCode: string }>> {
    const res = await this.emailConfirmRepo.save(emailConfirmData);

    return new ResultDTO(InternalCode.Success, {
      confirmationCode: res.confirmationCode,
    });
  }

  async save(
    emailConfirmData: UserEmailConfirmation,
  ): Promise<ResultDTO<null>> {
    const res = await this.emailConfirmRepo.save(emailConfirmData);

    return new ResultDTO(InternalCode.Success);
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<ResultDTO<{ userId: number }>> {
    const res = await this.emailConfirmRepo.findOneBy({
      confirmationCode: code,
    });
    if (!res) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, { userId: res.userId });
  }

  async findById(userId: number): Promise<ResultDTO<UserEmailConfirmation>> {
    const confirmData = await this.emailConfirmRepo.findOneBy({ userId });

    if (!confirmData) return new ResultDTO(InternalCode.NotFound);

    return new ResultDTO(InternalCode.Success, confirmData);
  }
}
