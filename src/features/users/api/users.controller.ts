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
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ExistingUserPipe } from '../../../infrastructure/pipes/ExistingUser.pipe';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { QueryBuildDTO } from '../../../shared/dto';
import { User } from '../domain/users.entity';
import { ViewUserModel } from './models/view/ViewUserModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private UsersService: UsersService,
    private UsersQueryRepository: UsersQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAllUsers(
    @Query() queryData: QueryParamsUserModel,
  ): Promise<QueryBuildDTO<User, ViewUserModel>> {
    const usersResult = await this.UsersQueryRepository.findUsers(queryData);

    return this.sendExceptionOrResponse(usersResult);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(
    @Body() inputModel: CreateUserModel,
  ): Promise<ViewUserModel> {
    const createdUserResult = await this.CommandBus.execute(
      new CreateUserCommand(
        inputModel.login,
        inputModel.email,
        inputModel.password,
        true,
      ),
    );
    this.sendExceptionOrResponse(createdUserResult);

    const userResult = await this.UsersQueryRepository.findUserById(
      createdUserResult.payload.userId,
    );

    return this.sendExceptionOrResponse(userResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(
    @Param('id', ExistingUserPipe)
    userId: string,
  ): Promise<void> {
    const deletedResult = await this.CommandBus.execute(
      new DeleteUserCommand(userId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }
}
