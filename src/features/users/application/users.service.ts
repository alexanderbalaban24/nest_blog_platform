import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/users.entity';
import { Types } from 'mongoose';
import { genSalt, hash } from 'bcrypt';

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
  ): Promise<string> {
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

  async deleteUser(userId: string): Promise<boolean> {
    const userInstance = await this.UsersRepository.findById(userId);
    if (!userInstance) return false;

    await userInstance.deleteOne();
    return true;
  }
}
