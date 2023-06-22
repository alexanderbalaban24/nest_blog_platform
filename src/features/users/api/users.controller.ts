import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserModel } from './models/input/CreateUserModel';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { QueryParamsUserModel } from './models/input/QueryParamsUserModel';
import { Types } from 'mongoose';
import { BasicAuthGuard } from '../../auth/guards/BasicAuthGuard';
import { ExistingUserPipe } from '../../../infrastructure/pipes/ExistingUser.pipe';
import { ParseObjectIdPipe } from '../../../infrastructure/pipes/ParseObjectId.pipe';
import { is } from 'date-fns/locale';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private UsersService: UsersService,
    private UsersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAllUsers(@Query() queryData: QueryParamsUserModel) {
    return await this.UsersQueryRepository.findUsers(queryData);
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

    const user = await this.UsersQueryRepository.findUserById(createdUserId);
    console.log(user);
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ExistingUserPipe)
    userId: Types.ObjectId,
  ) {
    const isDeleted = await this.UsersService.deleteUser(userId);
    if (!isDeleted) throw new NotFoundException();

    return isDeleted;
  }
}
