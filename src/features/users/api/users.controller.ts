import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserModel } from './models/input/CreateUserModel';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { QueryParamsUserModel } from './models/input/QueryParamsUserModel';
import { ParseObjectIdPipe } from '../../../infrastructure/pipes';
import { Types } from 'mongoose';
import { BasicAuthGuard } from '../../auth/guards/BasicAuthGuard';

@UseGuards(BasicAuthGuard)
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
      true,
    );
    if (!createdUserId) return false;

    return this.UsersQueryRepository.findUserById(createdUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseObjectIdPipe) userId: Types.ObjectId) {
    return this.UsersService.deleteUser(userId);
  }
}
