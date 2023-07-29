import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanForSpecificBlogCommand } from '../../application/use-cases/ban-unban-for-specific-blog-use-case';
import { ExistingUserPipe } from '../../../../infrastructure/pipes/ExistingUser.pipe';
import { UserBanForSpecificBlogModel } from '../models/input/UserBanForSpecificBlogModel';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { QueryParamsUserModel } from '../models/input/QueryParamsUserModel';
import { UsersQueryRepository } from '../../infrastructure/users.query-repository';

@Controller('blogger/users')
export class BloggerUsersController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private UsersQueryRepository: UsersQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get('blog/:id')
  async getAllBannedUsersForSpecificBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsUserModel,
  ) {
    const usersResult = await this.UsersQueryRepository.findBannedUsersForBlog(
      queryData,
      blogId,
    );

    return this.sendExceptionOrResponse(usersResult);
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUserForSpecificBlog(
    @Param('id', ExistingUserPipe) userId: string,
    @Body() inputData: UserBanForSpecificBlogModel,
  ): Promise<void> {
    const bannedUserResult = await this.CommandBus.execute(
      new BanUnbanForSpecificBlogCommand(
        userId,
        inputData.isBanned,
        inputData.banReason,
        inputData.blogId,
      ),
    );

    return this.sendExceptionOrResponse(bannedUserResult);
  }
}
