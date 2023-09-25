import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostLike } from '../../entities/post-like.entity';

export class PostsLikeRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostLike) private likesRepo: Repository<PostLike>,
  ) {}

  async save(like: PostLike): Promise<ResultDTO<null>> {
    await this.likesRepo.save(like);

    return new ResultDTO(InternalCode.Success);
  }

  async findLike(postId: number, userId: number): Promise<ResultDTO<PostLike>> {
    const post = await this.likesRepo.findOne({ where: { postId, userId } });

    return new ResultDTO(InternalCode.Success, post);
  }
}
