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
  Put,
  Query,
} from '@nestjs/common';
import { QueryParamsPostModel } from './models/input/QueryParamsPostModel';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreatePostModel } from './models/input/CreatePostModel';
import { PostsService } from '../application/posts.service';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../../../infrastructure/pipes';

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
  async getPost(@Param('id', ParseObjectIdPipe) postId) {
    const post = await this.PostsQueryRepository.findPostById(postId);
    if (!post) throw new NotFoundException();

    return post;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
    @Body() inputData: CreatePostModel,
  ) {
    return await this.PostsService.updatePost(
      postId,
      inputData.blogId,
      inputData.title,
      inputData.shortDescription,
      inputData.content,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ParseObjectIdPipe) postId: Types.ObjectId) {
    return await this.PostsService.deletePost(postId);
  }
}
