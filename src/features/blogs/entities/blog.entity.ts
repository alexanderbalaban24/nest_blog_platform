import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlogBan } from './blog-ban.entity';

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
}
