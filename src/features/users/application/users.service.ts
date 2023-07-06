import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/users.entity';
import { genSalt, hash } from 'bcrypt';
import { ResultDTO } from '../../../shared/dto';
import { InternalCode } from '../../../shared/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private UsersRepository: UsersRepository,
  ) {}

  //TODO количество раундов должно сидеть в env
  async createUser(
    login: string,
    email: string,
    password: string,
    isConfirmed: boolean,
  ): Promise<ResultDTO<{ userId: string }>> {
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(password, passwordSalt);

    const newUserInstance = this.UserModel.makeInstance(
      login,
      email,
      passwordHash,
      isConfirmed,
      this.UserModel,
    );
    return this.UsersRepository.create(newUserInstance);
  }

  async deleteUser(userId: string): Promise<ResultDTO<null>> {
    const userResult = await this.UsersRepository.findById(userId);
    if (userResult.hasError()) return new ResultDTO(InternalCode.NotFound);

    await userResult.payload.deleteOne();
    return new ResultDTO(InternalCode.Success);
  }
}
