import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';
import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

export class BanUnbanCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {}
}

@CommandHandler(BanUnbanCommand)
export class BanUnbanUseCase implements ICommandHandler<BanUnbanCommand> {
  constructor(
    private DevicesRepository: DevicesRepository,
    private UsersRepository: UsersRepository,
  ) {}

  async execute(command: BanUnbanCommand): Promise<ResultDTO<null>> {
    // Delete all devices
    if (command.isBanned) {
      const deleteDevicesResult = await this.DevicesRepository.deleteAllDevices(
        command.userId,
      );
      if (deleteDevicesResult.hasError())
        return new ResultDTO(InternalCode.Internal_Server);
    }

    // Mark banned user
    await this.UsersRepository.banUser(
      command.userId,
      command.isBanned,
      command.banReason,
    );

    /*// Deactivate posts of banned user
    let postsResult = await this.PostsRepository.findByUserId(command.userId);
    if (postsResult.payload.length) {
      const postPromises = postsResult.payload.map((postInstance) => {
        if (command.isBanned) {
          postInstance.deactivate();
        } else {
          postInstance.activate();
        }

        return this.PostsRepository.save(postInstance);
      });
      await Promise.all(postPromises);
    }

    // Deactivate like posts of banned user
    postsResult = await this.PostsRepository.findByUserLike(command.userId);
    if (postsResult.payload.length) {
      const postPromises = postsResult.payload.map((postInstance) => {
        if (command.isBanned) {
          postInstance.deactivateLike(command.userId);
        } else {
          postInstance.activateLike(command.userId);
        }

        return this.PostsRepository.save(postInstance);
      });
      await Promise.all(postPromises);
    }

    // Deactivate comments of banned user
    let commentsResult = await this.CommentsRepository.findByUserId(
      command.userId,
    );
    if (commentsResult.payload.length) {
      const commentPromises = commentsResult.payload.map((commentInstance) => {
        if (command.isBanned) {
          commentInstance.deactivate();
        } else {
          commentInstance.activate();
        }
        return this.CommentsRepository.save(commentInstance);
      });

      await Promise.all(commentPromises);
    }

    // Deactivate like comments of banned user
    commentsResult = await this.CommentsRepository.findByUserLike(
      command.userId,
    );
    if (commentsResult.payload.length) {
      const commentPromises = commentsResult.payload.map((commentInstance) => {
        if (command.isBanned) {
          commentInstance.deactivateLike(command.userId);
        } else {
          commentInstance.activateLike(command.userId);
        }
        return this.CommentsRepository.save(commentInstance);
      });

      await Promise.all(commentPromises);
    }
*/
    return new ResultDTO(InternalCode.Success);
  }
}
