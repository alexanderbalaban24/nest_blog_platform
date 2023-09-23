import { ResultDTO } from '../../../../shared/dto';
import { InternalCode } from '../../../../shared/enums';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
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
}
