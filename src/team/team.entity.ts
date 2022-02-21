import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Topic } from '../topics/topic.entity';
import { User } from '../users/user.entity';
import { TeamType } from './team.types';

function ImageLinkTransformerFrom(value: string | null): string | null {
  if (value == null) return value;
  const bucketName = process.env.AWS_S3_USER_PROFILE_ASSETS_BUCKET;
  const baseUrl = process.env.AWS_S3_BASE_URL;
  return `https://${bucketName}.${baseUrl}/${value}`;
}

function ImageLinkTransformerTo(value: string | null): string | null {
  if (value == null) return value;

  try {
    const url = new URL(value);
    const pathSplitted = url.pathname.split('/');
    return pathSplitted[pathSplitted.length - 1];
  } catch (e) {
    return value;
  }
}

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', nullable: true })
  linkWebsite?: string | null;

  @ManyToMany(() => Topic, { nullable: false, eager: true, cascade: true })
  @JoinTable({
    name: 'teams_topics',
    joinColumn: { name: 'team_id' },
    inverseJoinColumn: { name: 'topic_id' },
  })
  topics: Topic[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'teams_participant_users',
    joinColumn: { name: 'team_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  participantUsers: User[];

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'finished_at' })
  finishedAt?: Date | null;

  @Column({ type: 'enum', enum: TeamType, default: TeamType.PUBLIC })
  teamType: TeamType;

  @Column({ default: false })
  membersAllowedToHost: boolean;

  @Column({ default: false })
  membersAllowedToInvite: boolean;

  @OneToMany(() => TeamMember, (members) => members.team, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
    eager: true,
  })
  members: TeamMember[];

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'background_image',
    transformer: {
      from: ImageLinkTransformerFrom,
      to: ImageLinkTransformerTo,
    },
  })
  backgroundImage?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      from: ImageLinkTransformerFrom,
      to: ImageLinkTransformerTo,
    },
  })
  avatar?: string | null;

  @ManyToMany(() => User, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'teams_pending_users',
    joinColumn: { name: 'team_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  pendingUsers: User[];
}

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.members, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, { nullable: false, cascade: true })
  user: User;

  @Column({ default: false })
  isAccepted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
