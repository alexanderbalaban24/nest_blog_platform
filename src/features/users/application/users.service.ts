import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private UsersRepository: UsersRepository,
  ) {}

  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<string> {
    const newUserInstance = await this.UserModel.makeInstance(
      login,
      email,
      password,
      this.UserModel,
    );

    return this.UsersRepository.create(newUserInstance);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const userInstance = await this.UsersRepository.findById(userId);
    if (!userInstance) throw new NotFoundException();

    await userInstance.deleteOne();

    return true;
  }
}
