import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { RegistrationStatus } from './registration-status.entity';
import { Topic } from '../topics/topic.entity';
import { UsersFollowUsers } from './users-follow-users.entity';
import { Activity } from '../activity/activity.entity';

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
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ type: 'varchar', nullable: true, name: 'full_name' })
  fullName?: string | null;

  @Column({ name: 'vonage_user_token', nullable: true })
  vonageUserToken: string;

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

  @Column({ type: 'varchar', nullable: true })
  bio?: string | null;

  @Column({ type: 'varchar', nullable: true })
  location?: string | null;

  @Column({ type: 'varchar', nullable: true })
  website?: string | null;

  @Column({ type: 'varchar', nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', nullable: true })
  role?: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'public_key' })
  publicKey?: string | null;

  @Column({type:'boolean',name:'verified_public_key',default:false})
  isPublicKeyVerified:boolean;

  @Column({ type: 'varchar', nullable: true, name: 'verification_code' })
  verificationCode?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'verification_expire' })
  verificationExpire?: Date | null;

  @Column({ default: 0, name: 'verification_limit' })
  verificationLimit: number;

  @ManyToOne(() => RegistrationStatus, { nullable: false })
  @JoinColumn({ name: 'registration_status_id' })
  registrationStatus: RegistrationStatus;

  @ManyToMany(() => Topic, { cascade: true })
  @JoinTable({
    name: 'users_topics',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'topic_id' },
  })
  topics: Topic[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'users_inappropriate_users',
    joinColumn: { name: 'source_user_id' },
    inverseJoinColumn: { name: 'target_user_id' },
  })
  inappropriateUsers: User[];

  @OneToMany(() => UsersFollowUsers, (ufu) => ufu.sourceUser)
  followingUsers: UsersFollowUsers[];

  @OneToMany(() => UsersFollowUsers, (ufu) => ufu.targetUser)
  followerUsers: UsersFollowUsers[];

  @OneToMany(() => Activity, (ufu) => ufu.sourceUser)
  guestUser: Activity[];

  @OneToMany(() => Activity, (ufu) => ufu.targetUser)
  userInviting: Activity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
