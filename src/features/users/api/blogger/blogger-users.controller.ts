import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanForSpecificBlogCommand } from '../../application/use-cases/ban-unban-for-specific-blog-use-case';
import { ExistingUserPipe } from '../../../../infrastructure/pipes/ExistingUser.pipe';
import { UserBanForSpecificBlogModel } from '../models/input/UserBanForSpecificBlogModel';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';

@Controller('blogger/users')
export class BloggerUsersController extends ExceptionAndResponseHelper {
  constructor(private CommandBus: CommandBus) {
    super(ApproachType.http);
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
