import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserModel } from './models/input/CreateUserModel';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { QueryParamsUserModel } from './models/input/QueryParamsUserModel';

@Controller('users')
export class UsersController {
  constructor(
    private UsersService: UsersService,
    private UsersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAllUsers(@Query() queryData: QueryParamsUserModel) {
    return this.UsersQueryRepository.findUsers(queryData);
  }

  @Post()
  async createUser(@Body() inputModel: CreateUserModel) {
    const createdUserId = await this.UsersService.createUser(
      inputModel.login,
      inputModel.email,
      inputModel.password,
    );
    if (!createdUserId) return false;

    return this.UsersQueryRepository.findUserById(createdUserId);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    return this.UsersService.deleteUser(userId);
  }
}
