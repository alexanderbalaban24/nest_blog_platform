import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExistingCommentPipe } from '../../../infrastructure/pipes/ExistingComment.pipe';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateCommentModel } from './models/input/UpdateCommentModel';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { CommentsService } from '../application/comments.service';
import { LikeStatusModel } from './models/input/LikeStatusModel';

@Controller('comments')
export class CommentsController {
  constructor(
    private CommentsQueryRepository: CommentsQueryRepository,
    private CommentsService: CommentsService,
  ) {}

  @Get(':id')
  async getComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.CommentsQueryRepository.findCommentById(
      commentId,
      currentUserId,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @Body() inputModel: UpdateCommentModel,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.CommentsService.updateComment(
      commentId,
      inputModel.content,
      currentUserId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.CommentsService.deleteComment(commentId, currentUserId);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async likeStatus(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() inputModel: LikeStatusModel,
  ) {
    return this.CommentsService.likeStatus(
      commentId,
      currentUserId,
      inputModel.likeStatus,
    );
  }
}
