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
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from '../models/input/QueryParamsBlogModel';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { QueryBuildDTO } from '../../../../shared/dto';
import { ViewBlogModel } from '../models/view/ViewBlogModel';
import { CommandBus } from '@nestjs/cqrs';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { ExistingUserPipe } from '../../../../infrastructure/pipes/ExistingUser.pipe';
import { BindUserCommand } from '../../application/use-cases/bind-user-use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { BanBlogModel } from '../models/input/BanBlogModel';
import { BanUnbanBlogCommand } from '../../application/use-cases/ban-unban-blog-use-case';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private BlogsQueryRepository: BlogsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllBlogs(
    @Query() queryData: QueryParamsBlogModel,
    //TODO разбить модельку наверное, так как ViewBlogModel, в двух контроллерах отличаются
  ): Promise<QueryBuildDTO<any, ViewBlogModel>> {
    const blogResult = await this.BlogsQueryRepository.findBlogsForSA(
      queryData,
    );

    return this.sendExceptionOrResponse(blogResult);
  }

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindUser(
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Param('userId', ExistingUserPipe) userId: string,
  ): Promise<void> {
    const bindResult = await this.CommandBus.execute(
      new BindUserCommand(blogId, userId),
    );

    return this.sendExceptionOrResponse(bindResult);
  }

  @Put(':blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param('blogId', ExistingBlogPipe) blogId: string,
    @Body() inputData: BanBlogModel,
  ): Promise<void> {
    const banResult = await this.CommandBus.execute(
      new BanUnbanBlogCommand(blogId, inputData.isBanned),
    );

    return this.sendExceptionOrResponse(banResult);
  }
}
