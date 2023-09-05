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
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column()
  login: string;
  @Index()
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column({ default: () => 'now()', type: 'timestamp' })
  createdAt: Date;
  @OneToOne(() => UserBan, (ub) => ub.user, { onDelete: 'CASCADE' })
  ban: UserBan;
  @OneToMany(() => Device, (d) => d.user)
  devices: Device[];
}
