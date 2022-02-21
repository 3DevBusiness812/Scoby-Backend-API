import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  title?: string | null;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'sessions_participant_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  participantUsers: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'sessions_viewer_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  viewerUsers: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'green_room_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  greenRoomUsers: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'sessions_blocked_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  blockedUsers: User[];

  @ManyToMany(() => Topic, { nullable: false, eager: true, cascade: true })
  @JoinTable({
    name: 'sessions_topics',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'topic_id' },
  })
  topics: Topic[];

  @Column({ type: 'timestamp', nullable: true, name: 'finished_at' })
  finishedAt?: Date | null;

  @Column({ name: 'vonage_session_token', type: 'varchar', nullable: true })
  vonageSessionToken: string;

  @Column({ type: 'varchar', nullable: true })
  secondScreenLink?: string | null;

  @Column({ default: false })
  isPrivate: boolean;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'invited_users',
    joinColumn: { name: 'session_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  invitedUsers: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
