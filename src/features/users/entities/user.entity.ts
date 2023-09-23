import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserBan } from './user-ban.entity';
import { Device } from '../../devices/entities/device.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { CommentLike } from '../../comments/entities/comment-like.entity';
import { PostLike } from '../../posts/entities/post-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column({ collation: 'C' })
  login: string;
  @Index()
  @Column({ collation: 'C' })
  email: string;
  @Column()
  passwordHash: string;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
  @OneToOne(() => UserBan, (ub) => ub.user, { onDelete: 'CASCADE' })
  ban: UserBan;
  @OneToOne(() => UserEmailConfirmation, (uec) => uec.user, {
    onDelete: 'CASCADE',
  })
  emailConfirm: UserEmailConfirmation;
  @OneToMany(() => Device, (d) => d.user)
  devices: Device[];
  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];
  @OneToMany(() => CommentLike, (cl) => cl.user)
  commentLikes: CommentLike[];
  @OneToMany(() => PostLike, (pl) => pl.user)
  postLikes: PostLike[];
  /*@OneToMany(() => Blog, (b) => b.owner)
  blogs: Blog[];*/
}
