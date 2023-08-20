import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { QueryParamsBlogModel } from '../models/input/QueryParamsBlogModel';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query-repository';
import { QueryParamsPostModel } from '../../../posts/api/models/input/QueryParamsPostModel';
import { CurrentUserId } from '../../../infrastructure/decorators/params/current-user-id.param.decorator';
import { ExistingBlogPipe } from '../../../../infrastructure/pipes/ExistingBlog.pipe';
import { ExceptionAndResponseHelper } from '../../../../shared/helpers';
import { ApproachType } from '../../../../shared/enums';
import { ViewPostModel } from '../../../posts/api/models/view/ViewPostModel';
import { QueryBuildDTO } from '../../../../shared/dto';
import { ViewBlogModel } from '../models/view/ViewBlogModel';

@Controller('blogs')
export class PublicBlogsController extends ExceptionAndResponseHelper {
  constructor(
    private BlogsQueryRepository: BlogsQueryRepository,
    private PostsQueryRepository: PostsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  async getAllBlogs(
    @Query() queryData: QueryParamsBlogModel,
  ): Promise<QueryBuildDTO<any, ViewBlogModel>> {
    const blogResult = await this.BlogsQueryRepository.findBlogs(queryData);

    return this.sendExceptionOrResponse(blogResult);
  }

  @Get(':id')
  async getBlog(
    @Param('id', ExistingBlogPipe) blogId: string,
  ): Promise<ViewBlogModel> {
    const blogResult = await this.BlogsQueryRepository.findBlogById(blogId);

    return this.sendExceptionOrResponse(blogResult);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id', ExistingBlogPipe) blogId: string,
    @Query() queryData: QueryParamsPostModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<QueryBuildDTO<any, ViewPostModel>> {
    const postResult = await this.PostsQueryRepository.findPosts(
      queryData,
      blogId,
      currentUserId,
    );

    return this.sendExceptionOrResponse(postResult);
  }
}
