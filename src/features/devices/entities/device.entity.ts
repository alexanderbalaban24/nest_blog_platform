import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('users_devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  ip: string;
  @Column()
  deviceName: string;
  @Column()
  issuedAt: Date;
  @ManyToOne(() => User, (u) => u.devices, { onDelete: 'CASCADE' })
  user: User;
  @Column()
  userId: number;
}
