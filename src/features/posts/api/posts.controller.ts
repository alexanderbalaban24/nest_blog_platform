import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { QueryParamsPostModel } from './models/input/QueryParamsPostModel';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreatePostModel } from './models/input/CreatePostModel';
import { PostsService } from '../application/posts.service';
import { UpdatePostModel } from './models/input/UpdatePostModel';

@Controller('posts')
export class PostsController {
  constructor(
    private PostsQueryRepository: PostsQueryRepository,
    private PostsService: PostsService,
  ) {}

  @Get()
  async getAllPosts(@Query() queryData: QueryParamsPostModel) {
    return await this.PostsQueryRepository.findPosts(queryData);
  }

  @Post()
  async createPost(@Body() inputData: CreatePostModel) {
    const createdPostId = await this.PostsService.createPost(
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );

    return await this.PostsQueryRepository.findPostById(createdPostId);
  }

  @Get(':id')
  async getPost(@Param('id') postId) {
    const post = await this.PostsQueryRepository.findPostById(postId);
    if (!post) throw new NotFoundException();

    return post;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param('id') postId, @Body() inputData: UpdatePostModel) {
    return await this.PostsService.updatePost(
      postId,
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') postId) {
    return await this.PostsService.deletePost(postId);
  }
}
