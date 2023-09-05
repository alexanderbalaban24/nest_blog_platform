import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('users_ban')
export class UserBan {
  @Column({ default: false })
  isBanned: boolean;
  @Column({ nullable: true })
  banReason: string;
  @Column({ default: () => 'now()', type: 'timestamp', nullable: true })
  banDate: Date;
  @OneToOne(() => User, (u) => u.ban, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @PrimaryColumn()
  userId: number;
}
