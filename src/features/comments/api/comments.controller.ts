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
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { UpdateCommentModel } from './models/input/UpdateCommentModel';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.param.decorator';
import { LikeStatusModel } from './models/input/LikeStatusModel';
import { ExceptionAndResponseHelper } from '../../../shared/helpers';
import { ApproachType } from '../../../shared/enums';
import { ViewCommentModel } from './models/view/ViewCommentModel';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';
import { LikeStatusCommentCommand } from '../application/use-cases/like-status-comment-use-case';

@Controller('comments')
export class CommentsController extends ExceptionAndResponseHelper {
  constructor(
    private CommandBus: CommandBus,
    private CommentsQueryRepository: CommentsQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get(':id')
  async getComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<ViewCommentModel> {
    const commentResult = await this.CommentsQueryRepository.findCommentById(
      commentId,
      currentUserId,
    );

    return this.sendExceptionOrResponse(commentResult);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async updateComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @Body() inputModel: UpdateCommentModel,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const updatedResult = await this.CommandBus.execute(
      new UpdateCommentCommand(commentId, inputModel.content, currentUserId),
    );

    return this.sendExceptionOrResponse(updatedResult);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async deleteComment(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const deletedResult = await this.CommandBus.execute(
      new DeleteCommentCommand(commentId, currentUserId),
    );

    return this.sendExceptionOrResponse(deletedResult);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async likeStatus(
    @Param('id', ExistingCommentPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() inputModel: LikeStatusModel,
  ): Promise<void> {
    const likeResult = await this.CommandBus.execute(
      new LikeStatusCommentCommand(
        commentId,
        currentUserId,
        inputModel.likeStatus,
      ),
    );

    return this.sendExceptionOrResponse(likeResult);
  }
}
