import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanForSpecificBlogCommand } from '../../application/use-cases/ban-unban-for-specific-blog-use-case';
import { ExistingUserPipe } from '../../../../infrastructure/pipes/ExistingUser.pipe';
import { UserBanForSpecificBlogModel } from '../models/input/UserBanForSpecificBlogModel';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType, InternalCode } from '../../../../shared/enums';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { QueryParamsUserModel } from '../models/input/QueryParamsUserModel';
import { UsersQueryRepository } from '../../infrastructure/users/users.query-repository';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.param.decorator';
import { JwtAccessAuthGuard } from '../../../auth/guards/jwt-access-auth.guard';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';
import { ResultDTO } from '../../../../shared/dto';

@UseGuards(JwtAccessAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private UsersQueryRepository: UsersQueryRepository,
    private BlogsQueryRepository: BlogsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get('blog/:id')
  async getAllBannedUsersForSpecificBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsUserModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const blogsResult = await this.BlogsQueryRepository.findBlogById(
      blogId,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      true,
    );
    if (blogsResult.hasError())
      return this.sendExceptionOrResponse(
        new ResultDTO(InternalCode.Internal_Server),
      );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (blogsResult.payload.blogOwnerInfo.userId !== currentUserId.toString())
      return this.sendExceptionOrResponse(
        new ResultDTO(InternalCode.Forbidden),
      );

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
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const bannedUserResult = await this.CommandBus.execute(
      new BanUnbanForSpecificBlogCommand(
        userId,
        inputData.isBanned,
        inputData.banReason,
        inputData.blogId,
        currentUserId,
      ),
    );

    return this.sendExceptionOrResponse(bannedUserResult);
  }
}
