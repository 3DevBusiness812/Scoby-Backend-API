import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true,
  })
  @Index()
  @JoinColumn({ name: 'source_user_id' })
  sourceUser: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    primary: true,
  })
  @Index()
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column()
  type_action: string;

  @Column({ nullable: true })
  procedure_action: number;

  @Column({ nullable: true, type: 'varchar' })
  additionalPayload: string;
}
