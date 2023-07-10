import {
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
import { Blog } from '../../domain/blogs.entity';
import { CommandBus } from '@nestjs/cqrs';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { ExistingUserPipe } from '../../../../infrastructure/pipes/ExistingUser.pipe';
import { BindUserCommand } from '../../application/use-cases/bind-user-use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';

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
  ): Promise<QueryBuildDTO<Blog, ViewBlogModel>> {
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
}
