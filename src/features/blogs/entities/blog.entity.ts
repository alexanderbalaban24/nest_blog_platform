import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogBan } from './blog-ban.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column({ default: false })
  isMembership: boolean;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
  /*@ManyToOne(() => User, (u) => u.blogs)
  owner: User;
  @Column()
  ownerId: number;*/
  @OneToOne(() => BlogBan, (bb) => bb.blog)
  ban: BlogBan;
  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];
}
