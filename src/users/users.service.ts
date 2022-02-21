import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Activity } from '../activity/activity.entity';
import {
  Brackets,
  getConnection,
  getRepository,
  ILike,
  Not,
  QueryBuilder,
  In,
} from 'typeorm';
import { RegistrationStatusEnum } from './registration-status.entity';
import { ApolloError } from 'apollo-server-express';
import { USERS_ERRORS, usersParamsMessages } from './users.messages';
import { KARTRA_ERRORS } from '../lib/kartra/kartra.messages';
import { ConfigService } from '@nestjs/config';
import {
  UserVerificationExpire,
  UserLoginResult,
  UserProfile,
  UserProfileCreation,
  UserProfileWithAuth,
  UserProfileEdit,
  UserVerificationResult,
  ResetPasswordVerificationResult,
  LeadCreation,
  LeadCreationResult,
  GetUsersResult,
  InappropriateCheckResult,
  FollowCounts,
  FollowStats,
  LeadSuscriptionList,
  SuscribeLeadCalendar,
  RecommendationsData,
  RecommendationsDataAllUsers,
} from './users.graphql';
import { JwtService, JwtType } from '../lib/jwt/jwt.service';
import { ScryptService } from '../lib/scrypt/scrypt.service';
import { SmsService } from '../lib/sms/sms.service';
import { TopicsService } from '../topics/topics.service';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { S3Service } from '../lib/s3/s3.service';
import {
  ImageProcessorService,
  ImageTargetType,
} from '../lib/image-processor/image-processor.service';
import { KartraService } from '../lib/kartra/kartra.service';
import { Topic } from '../topics/topic.entity';
import { UsersFollowUsers } from './users-follow-users.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Series } from '../series/series.entity';
import { RecommendationUsers } from './recommendationUsers.service';
import { ActivityActionTypes } from 'src/activity/activity.types';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private scryptService: ScryptService,
    private smsService: SmsService,
    private topicsService: TopicsService,
    private s3Service: S3Service,
    private imageProcessorService: ImageProcessorService,
    private kartraService: KartraService,
    private notificationsService: NotificationsService,
    private recommendationUsers: RecommendationUsers,
  ) {}

  async createUser(phone: string): Promise<UserVerificationExpire> {
    const repository = getRepository(User);
    const existingUser = await repository.findOne(
      { phone },
      { relations: ['registrationStatus'] },
    );

    if (
      existingUser &&
      existingUser.registrationStatus.id === RegistrationStatusEnum.COMPLETED
    ) {
      throw new ApolloError(
        USERS_ERRORS.USER_EXISTS.MESSAGE,
        USERS_ERRORS.USER_EXISTS.CODE,
      );
    }

    const countVerification = existingUser
      ? this.getLimitVerificationCode(existingUser)
      : 0;
    const verificationCode = this.generateVerificationCode();
    const verificationExpire = this.getVerificationExpire();

    if (await this.isAvailableCreateUser()) {
      await repository.save({
        id: existingUser?.id,
        phone,
        verificationCode,
        verificationExpire,
        verificationLimit: countVerification + 1,
        registrationStatus: {
          id: RegistrationStatusEnum.CREATED,
        },
      });

    await this.smsService.sendMessage(
      phone,
      usersParamsMessages.createUserSmsVerification(verificationCode),
    );
    }

    return {
      phone,
      verificationExpire,
    };
  }

  async verifyUserPhone(
    phone: string,
    code: string,
  ): Promise<UserVerificationResult> {
    const repository = getRepository(User);
    const existingUser = await repository.findOne(
      { phone },
      { relations: ['registrationStatus'] },
    );

    if (!existingUser) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (existingUser.registrationStatus.id !== RegistrationStatusEnum.CREATED) {
      throw new ApolloError(
        USERS_ERRORS.WRONG_REGISTRATION_STEP.MESSAGE,
        USERS_ERRORS.WRONG_REGISTRATION_STEP.CODE,
      );
    }

    if (code !== existingUser.verificationCode) {
      throw new ApolloError(
        USERS_ERRORS.INVALID_VERIFICATION_CODE.MESSAGE,
        USERS_ERRORS.INVALID_VERIFICATION_CODE.CODE,
      );
    }

    if (new Date() > (existingUser.verificationExpire as Date)) {
      throw new ApolloError(
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.MESSAGE,
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.CODE,
      );
    }

    await repository.save({
      id: existingUser.id,
      verificationCode: null,
      verificationExpire: null,
      registrationStatus: {
        id: RegistrationStatusEnum.VERIFIED,
      },
    });

    return {
      registrationToken: await this.jwtService.sign(
        { phone },
        JwtType.REGISTRATION,
      ),
    };
  }

  async createTokenRegister(
    registrationToken: string,
  ): Promise<UserVerificationResult> {
    if (registrationToken !== 'pSHDtTIk/GbvnSvEETckksyQ3XsULwwJns4cylex') {
      throw new ApolloError(
        USERS_ERRORS.INVALID_VERIFICATION_CODE.MESSAGE,
        USERS_ERRORS.INVALID_VERIFICATION_CODE.CODE,
      );
    }
    return {
      registrationToken: await this.jwtService.sign(
        ['create_user'],
        JwtType.CREATE_USER,
      ),
    };
  }

  async createUserProfile(
    profile: UserProfileCreation,
  ): Promise<UserProfileWithAuth> {
    const { registrationToken, ...profileProps } = profile;

    const { phone } = await this.jwtService.verify(
      registrationToken,
      JwtType.REGISTRATION,
    );

    const repository = getRepository(User);
    const existingUser = await repository.findOne(
      { phone },
      { relations: ['registrationStatus'] },
    );

    if (!existingUser) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (
      existingUser.registrationStatus.id !== RegistrationStatusEnum.VERIFIED
    ) {
      throw new ApolloError(
        USERS_ERRORS.WRONG_REGISTRATION_STEP.MESSAGE,
        USERS_ERRORS.WRONG_REGISTRATION_STEP.CODE,
      );
    }

    const usernameUser = await repository.findOne({
      username: profileProps.username,
    });

    if (usernameUser) {
      throw new ApolloError(
        USERS_ERRORS.USERNAME_EXISTS.MESSAGE,
        USERS_ERRORS.USERNAME_EXISTS.CODE,
      );
    }

    const topics = await this.topicsService.getTopicsOrFail(
      profileProps.topics,
    );

    profileProps.password = await this.scryptService.hash(
      profileProps.password,
    );

    await this.kartraService.createLead({
      email: profileProps.email,
      firstName: profileProps.fullName,
      lastName: '',
    });

    await repository.save({
      id: existingUser.id,
      username: profileProps.username,
      password: profileProps.password,
      birthday: profileProps.birthday,
      email: profileProps.email,
      fullName: profileProps.fullName,
      topics,
      registrationStatus: {
        id: RegistrationStatusEnum.COMPLETED,
      },
    });

    const user = (await repository.findOne(existingUser.id)) as User;
    const authorizationToken = await this.jwtService.sign(
      {
        id: user.id,
        phone: user.phone,
      },
      JwtType.AUTHORIZATION,
    );

    return {
      ...user,
      auth: { authorizationToken },
    };
  }

  async getUserProfile(
    currentUserId: number,
    userId?: number,
  ): Promise<UserProfile> {
    const repository = getRepository(User);
    const user = await repository.findOne(userId ?? currentUserId, {
      where: { registrationStatus: { id: RegistrationStatusEnum.COMPLETED } },
    });

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    return user;
  }

  async getRecommendationsData(userId: number): Promise<RecommendationsData> {
    const user = await this.getUserProfile(userId, userId);

    const topics = await this.getUserTopics(userId);

    const follows = await this.getFollowingUsers(userId, {
      limit: 100,
      page: 1,
    });

    return {
      ...user,
      follows: follows.data,
      topics,
    };
  }

  async getRecommendationsDataAllUsers(): Promise<RecommendationsDataAllUsers> {
    const activity = await getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.topics', 'topics')
      .getMany();

    const data = [];
    for await (const user of activity) {
      const userFollows = await this.getFollowingUsers(user.id, {
        limit: 100,
        page: 1,
      });
      const follows = { follows: userFollows.data };
      const userData = Object.assign(follows, user);
      data.push(userData);
    }
    return { users: data };
  }

  async getUsers(
    paging: Paging,
    currentUserId?: number,
    query?: string,
  ): Promise<GetUsersResult> {
    const repository = getRepository(User);

    const usersRecommendation = currentUserId
      ? await this.getUserMember(currentUserId)
      : [];
    const idRecommendation = !query
      ? usersRecommendation.map((user) => user.id)
      : [];
    idRecommendation.push(currentUserId || 0);

    const parsedQuery = `%${query}%`;

    let queryBuilder = repository
      .createQueryBuilder()
      .where({
        id: Not(In(idRecommendation)),
        registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
      })
      .orderBy({
        created_at: 'DESC',
      });

    if (query) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) =>
          qb
            .where('username ILIKE :parsedQuery', { parsedQuery })
            .orWhere('full_name ILIKE :parsedQuery', { parsedQuery }),
        ),
      );
    }

    let users: UserProfile[] = [],
      recommendation: UserProfile[] = [];

    if (!query) {
      recommendation = await repository
        .createQueryBuilder('user')
        .where('user.id IN (:...idRecommendation)', { idRecommendation })
        .andWhere('user.id != :currentUserId', { currentUserId })
        .skip(paging.limit * (paging.page - 1))
        .take(paging.limit)
        .getMany();
    }

    if (recommendation.length < paging.limit) {
      const limit = Math.abs(recommendation.length - paging.limit);
      const skip =
        recommendation.length === 0 && !query
          ? Math.abs(
              idRecommendation.length - 1 - paging.limit * (paging.page - 1),
            )
          : 0;
      users = await queryBuilder.skip(skip).take(limit).getMany();
    }

    const total = (await queryBuilder.getCount()) + idRecommendation.length - 1;
    return {
      data: recommendation.concat(users),
      paging: { page: paging.page, limit: paging.limit, total },
      query,
    };
  }

  async updateUserProfile(
    currentUserId: number,
    profile: UserProfileEdit,
  ): Promise<UserProfile> {
    const repository = getRepository(User);

    if (profile.username) {
      const usernameUser = await repository.findOne({
        id: Not(currentUserId),
        username: profile.username,
      });

      if (usernameUser) {
        throw new ApolloError(
          USERS_ERRORS.USERNAME_EXISTS.MESSAGE,
          USERS_ERRORS.USERNAME_EXISTS.CODE,
        );
      }
    }

    let topics;

    if (profile.topics) {
      topics = await this.topicsService.getTopicsOrFail(profile.topics);
    }
    if (profile.email && profile.fullName)
      await this.kartraService.createLead({
        email: profile.email,
        firstName: profile.fullName,
        lastName: '',
      });

    await repository.save({ ...profile, topics, id: currentUserId });
    return repository.findOne(currentUserId) as Promise<User>;
  }

  async uploadFile(
    currentUserId: number,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<UserProfile> {
    const repository = getRepository(User);
    const user = (await repository.findOne(currentUserId)) as User;

    const removeAssets = [];

    if (avatar && user.avatar) {
      removeAssets.push(user.avatar);
    }

    if (backgroundImage && user.backgroundImage) {
      removeAssets.push(user.backgroundImage);
    }

    if (removeAssets.length) {
      await this.s3Service.removeFiles(removeAssets);
    }

    let avatarUpload;
    let backgroundImageUpload;

    if (avatar) {
      avatarUpload = this.imageProcessorService.optimizeImage(
        avatar.createReadStream(),
        ImageTargetType.AVATAR,
      );
    }

    if (backgroundImage) {
      backgroundImageUpload = this.imageProcessorService.optimizeImage(
        backgroundImage.createReadStream(),
        ImageTargetType.BACKGROUND_IMAGE,
      );
    }

    const [avatarResult, backgroundImageResult] = await Promise.all([
      avatarUpload
        ? this.s3Service.uploadFile({
            extension: avatarUpload.extension,
            mime: avatarUpload.mime,
            stream: avatarUpload.stream,
          })
        : undefined,
      backgroundImageUpload
        ? this.s3Service.uploadFile({
            extension: backgroundImageUpload.extension,
            mime: backgroundImageUpload.mime,
            stream: backgroundImageUpload.stream,
          })
        : undefined,
    ]);

    await repository.save({
      id: currentUserId,
      avatar: avatarResult?.Key,
      backgroundImage: backgroundImageResult?.Key,
    });

    return (await repository.findOne(currentUserId)) as User;
  }

  async loginUser(phone: string, password: string): Promise<UserLoginResult> {
    const repository = getRepository(User);
    let user: User;

    try {
      user = await repository.findOneOrFail(
        {
          phone,
          registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
        },
        { select: ['id', 'phone', 'password'] },
      );
      await this.scryptService.verify(password, user.password);
    } catch (e) {
      throw new ApolloError(
        USERS_ERRORS.INCORRECT_PHONE_OR_PASSWORD.MESSAGE,
        USERS_ERRORS.INCORRECT_PHONE_OR_PASSWORD.CODE,
      );
    }

    const authorizationToken = await this.jwtService.sign(
      {
        id: user.id,
        phone: user.phone,
      },
      JwtType.AUTHORIZATION,
    );

    return { authorizationToken };
  }

  async loginUserName(
    username: string,
    password: string,
  ): Promise<UserVerificationExpire> {
    const repository = getRepository(User);
    let user: User;
    try {
      user = await repository.findOneOrFail(
        {
          username,
          registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
        },
        { select: ['id', 'phone', 'password'] },
      );
      await this.scryptService.verify(password, user.password);
    } catch (e) {
      throw new ApolloError(
        USERS_ERRORS.INCORRECT_USERNAME_OR_PASSWORD.MESSAGE,
        USERS_ERRORS.INCORRECT_USERNAME_OR_PASSWORD.CODE,
      );
    }

    const countVerification = this.getLimitVerificationCode(user);
    const verificationCode = this.generateVerificationCode();
    const verificationExpire = this.getVerificationExpire();

    await this.smsService.sendMessage(
      user.phone,
      usersParamsMessages.createUserSmsVerification(verificationCode),
    );

    await repository.save({
      id: user.id,
      verificationCode: verificationCode,
      verificationExpire: verificationExpire,
      verificationLimit: countVerification + 1,
    });

    return {
      phone: user.phone,
      verificationExpire,
    };
  }

  async verificationCodeScobyGold(
    code: string,
    username: string,
  ): Promise<UserLoginResult> {
    const repository = getRepository(User);
    const existingUser = await repository.findOne(
      { username },
      { relations: ['registrationStatus'] },
    );
    if (!existingUser) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (code !== existingUser.verificationCode) {
      throw new ApolloError(
        USERS_ERRORS.INVALID_VERIFICATION_CODE.MESSAGE,
        USERS_ERRORS.INVALID_VERIFICATION_CODE.CODE,
      );
    }

    if (new Date() > (existingUser.verificationExpire as Date)) {
      throw new ApolloError(
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.MESSAGE,
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.CODE,
      );
    }
    const authorizationToken = await this.jwtService.sign(
      {
        id: existingUser.id,
        phone: existingUser.phone,
      },
      JwtType.AUTHORIZATION,
    );

    return { authorizationToken };
  }

  async resetPassword(phone: string): Promise<UserVerificationExpire> {
    const repository = getRepository(User);
    const user = await repository.findOne({
      phone,
      registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
    });

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    const countVerification = this.getLimitVerificationCode(user);
    const verificationCode = this.generateVerificationCode();
    const verificationExpire = this.getVerificationExpire();

    await repository.save({
      id: user.id,
      verificationCode,
      verificationExpire,
      verificationLimit: countVerification + 1,
    });

    await this.smsService.sendMessage(
      phone,
      usersParamsMessages.resetPasswordSmsVerification(verificationCode),
    );

    return {
      phone,
      verificationExpire,
    };
  }

  async confirmResetPassword(
    phone: string,
    code: string,
  ): Promise<ResetPasswordVerificationResult> {
    const repository = getRepository(User);
    const user = await repository.findOne({
      phone,
      registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
    });

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (!user.verificationCode || code !== user.verificationCode) {
      throw new ApolloError(
        USERS_ERRORS.INVALID_VERIFICATION_CODE.MESSAGE,
        USERS_ERRORS.INVALID_VERIFICATION_CODE.CODE,
      );
    }

    if (new Date() > (user.verificationExpire as Date)) {
      throw new ApolloError(
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.MESSAGE,
        USERS_ERRORS.VERIFICATION_CODE_EXPIRED.CODE,
      );
    }

    await repository.save({
      id: user.id,
      verificationCode: null,
      verificationExpire: null,
    });

    return {
      passwordResetToken: await this.jwtService.sign(
        { phone },
        JwtType.RESET_PASSWORD,
      ),
    };
  }

  async updatePassword(
    token: string,
    password: string,
  ): Promise<UserProfileWithAuth> {
    const repository = getRepository(User);
    const { phone } = await this.jwtService.verify(
      token,
      JwtType.RESET_PASSWORD,
    );

    const user = await repository.findOne({
      phone,
      registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
    });

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    await repository.save({
      id: user.id,
      password: await this.scryptService.hash(password),
    });

    const authorizationToken = await this.jwtService.sign(
      {
        id: user.id,
        phone: user.phone,
      },
      JwtType.AUTHORIZATION,
    );

    return {
      ...user,
      auth: {
        authorizationToken,
      },
    };
  }

  async markUserInappropriate(
    currentUserId: number,
    userId: number,
  ): Promise<User> {
    const repository = getRepository(User);
    const currentUser = (await repository.findOne(currentUserId, {
      relations: ['inappropriateUsers'],
    })) as User;
    const user = await repository.findOne(userId);

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (user.id === currentUserId) {
      throw new ApolloError(
        USERS_ERRORS.INVALID_USER.CODE,
        USERS_ERRORS.INVALID_USER.MESSAGE,
      );
    }

    if (!currentUser.inappropriateUsers.find((u) => u.id === userId)) {
      await getConnection()
        .createQueryBuilder()
        .relation(User, 'inappropriateUsers')
        .of(currentUserId)
        .add(userId);
    }

    return user;
  }

  async getInappropriateUsers(currentUserId: number): Promise<User[]> {
    const repository = getRepository(User);
    const result = (await repository.findOne(currentUserId, {
      relations: ['inappropriateUsers'],
    })) as User;

    return result.inappropriateUsers;
  }

  async createLead(
    registrationToken: string,
    lead: LeadCreation,
  ): Promise<LeadCreationResult> {
    const repository = getRepository(User);
    const isDisabled = this.configService.get('kartra.disableLeads');

    const { phone } = await this.jwtService.verify(
      registrationToken,
      JwtType.REGISTRATION,
    );

    if (isDisabled) return { ...lead, phone };

    const [user, userWithEmail] = await Promise.all([
      repository.findOne({ phone }),
      repository.findOne({ email: lead.email, phone: Not(phone) }),
    ]);

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (userWithEmail) {
      throw new ApolloError(
        USERS_ERRORS.EMAIL_EXISTS.MESSAGE,
        USERS_ERRORS.EMAIL_EXISTS.CODE,
      );
    }

    await repository.save({
      id: user.id,
      email: lead.email,
      fullName: `${lead.firstName} ${lead.lastName}`,
    });

    try {
      await this.kartraService.createLead(lead);
    } catch (e) {}

    return { ...lead, phone };
  }

  async checkInappropriateUser(
    currentUserId: number,
    userId: number,
  ): Promise<InappropriateCheckResult> {
    const isInappropriate = !!(await getConnection()
      .createQueryBuilder()
      .select('u.id')
      .from(User, 'u')
      .innerJoin('u.inappropriateUsers', 'iu')
      .where('u.id = :sourceId', { sourceId: currentUserId })
      .andWhere('iu.id = :targetId', { targetId: userId })
      .getOne());

    return { userId, inappropriate: isInappropriate };
  }

  async getUserTopics(userId: number): Promise<Topic[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(User, 'topics')
      .of(userId)
      .loadMany();
  }

  async followUser(currentUserId: number, userId: number): Promise<User> {
    const repository = getRepository(User);

    if (currentUserId === userId) {
      throw new ApolloError(
        USERS_ERRORS.UNABLE_FOLLOW_YOURSELF.MESSAGE,
        USERS_ERRORS.UNABLE_FOLLOW_YOURSELF.CODE,
      );
    }

    const targetUser = await repository.findOne({
      id: userId,
      registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
    });

    if (!targetUser) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(UsersFollowUsers)
      .values({
        sourceUser: {
          id: currentUserId,
        },
        targetUser: {
          id: userId,
        },
      })
      .orIgnore()
      .execute();

    const createdAt = new Date(Date.now());

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Activity)
      .values({
        sourceUser: {
          id: currentUserId,
        },
        targetUser: {
          id: userId,
        },
        type_action: ActivityActionTypes.FOLLOW_USER,
        createdAt: createdAt,
      })
      .orIgnore()
      .execute();

    this.notificationsService.sendFollowUserNotification(currentUserId, userId);

    return targetUser;
  }

  async unfollowUser(currentUserId: number, userId: number): Promise<User> {
    const repository = getRepository(User);

    if (currentUserId === userId) {
      throw new ApolloError(
        USERS_ERRORS.UNABLE_UNFOLLOW_YOURSELF.MESSAGE,
        USERS_ERRORS.UNABLE_UNFOLLOW_YOURSELF.CODE,
      );
    }

    const targetUser = await repository.findOne({
      id: userId,
      registrationStatus: { id: RegistrationStatusEnum.COMPLETED },
    });

    if (!targetUser) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(UsersFollowUsers)
      .where({
        sourceUser: {
          id: currentUserId,
        },
        targetUser: {
          id: userId,
        },
      })
      .execute();

    return targetUser;
  }

  async getFollowerUsers(
    userId: number,
    paging: Paging,
  ): Promise<GetUsersResult> {
    const repository = getRepository(UsersFollowUsers);
    const [users, count] = await repository.findAndCount({
      where: {
        targetUser: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      skip: paging.limit * (paging.page - 1),
      take: paging.limit,
      relations: ['sourceUser'],
    });

    return {
      data: users.map((ufu) => ufu.sourceUser),
      paging: { page: paging.page, limit: paging.limit, total: count },
    };
  }

  async getFollowingUsers(
    userId: number,
    paging: Paging,
  ): Promise<GetUsersResult> {
    const repository = getRepository(UsersFollowUsers);
    const [users, count] = await repository.findAndCount({
      where: {
        sourceUser: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      skip: paging.limit * (paging.page - 1),
      take: paging.limit,
      relations: ['targetUser'],
    });

    return {
      data: users.map((ufu) => ufu.targetUser),
      paging: { page: paging.page, limit: paging.limit, total: count },
    };
  }

  async getFollowCounts(userProfile: UserProfile): Promise<FollowCounts> {
    const [followers, following] = await Promise.all([
      getConnection()
        .createQueryBuilder()
        .from(UsersFollowUsers, 'u')
        .innerJoin('u.targetUser', 'tu')
        .where('tu.id = :userId', { userId: userProfile.id })
        .getCount(),
      getConnection()
        .createQueryBuilder()
        .from(UsersFollowUsers, 'u')
        .innerJoin('u.sourceUser', 'su')
        .where('su.id = :userId', { userId: userProfile.id })
        .getCount(),
    ]);

    return { followers, following };
  }

  async getFollowStats(
    userProfile: UserProfile,
    currentUserId: number | undefined,
  ): Promise<FollowStats> {
    if (!currentUserId)
      return { followingCurrentUser: null, followedByCurrentUser: null };

    const [followingCurrentUser, followedByCurrentUser] = await Promise.all([
      getConnection()
        .createQueryBuilder()
        .select('1')
        .from(UsersFollowUsers, 'u')
        .where({
          sourceUser: { id: userProfile.id },
          targetUser: { id: currentUserId },
        })
        .getRawOne(),
      getConnection()
        .createQueryBuilder()
        .select('1')
        .from(UsersFollowUsers, 'u')
        .where({
          sourceUser: { id: currentUserId },
          targetUser: { id: userProfile.id },
        })
        .getRawOne(),
    ]);

    return {
      followingCurrentUser: !!followingCurrentUser,
      followedByCurrentUser: !!followedByCurrentUser,
    };
  }

  getLimitVerificationCode(user: User): number {
    if (user.verificationLimit >= 3) {
      if (new Date() < (user.verificationExpire as Date)) {
        throw new ApolloError(
          USERS_ERRORS.VERIFICATION_CODE_LIMIT.MESSAGE,
          USERS_ERRORS.VERIFICATION_CODE_LIMIT.CODE,
        );
      } else {
        return 0;
      }
    }
    return user.verificationLimit;
  }

  generateVerificationCode(): string {
    if (process.env.NODE_ENV !== 'production') {
      return '0000';
    }

    return Math.floor(Math.random() * 9999 + 1)
      .toString()
      .padStart(4, '0');
  }

  getVerificationExpire(): Date {
    return new Date(
      Date.now() +
        (this.configService.get('app.verificationCodeExpire') as number),
    );
  }

  async kartraUserSuscription({
    email,
    name,
  }: LeadSuscriptionList): Promise<LeadSuscriptionList> {
    try {
      await this.kartraService.createLead({
        email,
        firstName: name,
        lastName: '',
      });
      await this.kartraService.suscribeLeadToWaitingList({ email, name });
    } catch (e) {
      throw new ApolloError(
        USERS_ERRORS.EMAIL_EXISTS.MESSAGE,
        USERS_ERRORS.EMAIL_EXISTS.CODE,
      );
    }

    return { email, name };
  }

  async kartraSuscribeLeadCalendar(
    currentUserId: number,
    name: string,
    className: string,
  ): Promise<SuscribeLeadCalendar> {
    const repository = getRepository(User);
    const user = await repository.findOne(currentUserId);
    if (!user?.email) {
      throw new ApolloError(
        USERS_ERRORS.USERNAME_EXISTS.MESSAGE,
        USERS_ERRORS.USERNAME_EXISTS.CODE,
      );
    }

    const { type } = await this.kartraService.kartraSuscribeLeadCalendar(
      user.email,
      name,
      className,
    );
    this.errorMessageKartraCalendar(type);

    return { email: user.email, name, className };
  }

  async kartraCreateCalendar(
    currentUserId: number,
    name: string,
    className: string,
  ): Promise<SuscribeLeadCalendar> {
    const testDummy = 'userTest@TEST.com';
    const { type } = await this.kartraService.kartraSuscribeLeadCalendar(
      testDummy,
      name,
      className,
    );

    this.errorMessageKartraCalendar(type);

    return { email: testDummy, name, className };
  }

  async kartraUnSuscribeCalendar(
    currentUserId: number,
    calendarId: number,
  ): Promise<SuscribeLeadCalendar> {
    const repository = getRepository(Series);
    const serie = await repository.findOne(calendarId);
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(currentUserId);

    if (!user?.email) {
      throw new ApolloError(
        USERS_ERRORS.USERNAME_EXISTS.MESSAGE,
        USERS_ERRORS.USERNAME_EXISTS.CODE,
      );
    }

    if (!serie?.className || !serie?.calendarName) {
      throw new ApolloError(
        KARTRA_ERRORS.CALENDAR_EXIST.MESSAGE,
        KARTRA_ERRORS.CALENDAR_EXIST.CODE,
      );
    }

    const { type } = await this.kartraService.kartraUnsubscribeCalendar(
      user.email,
      serie.calendarName,
      serie.className,
    );

    this.errorMessageKartraCalendar(type);

    return {
      email: user.email,
      name: serie.calendarName,
      className: serie.className,
    };
  }

  errorMessageKartraCalendar(type: number): void {
    if (type === 257 || type === 255) {
      throw new ApolloError(
        KARTRA_ERRORS.CALENDAR_EXIST.MESSAGE,
        KARTRA_ERRORS.CALENDAR_EXIST.CODE,
      );
    }
    if (type === 258 || type === 256) {
      throw new ApolloError(
        KARTRA_ERRORS.CLASS_EXIST.MESSAGE,
        KARTRA_ERRORS.CLASS_EXIST.CODE,
      );
    }
  }

  async getKartraUser(currentUserId: number): Promise<void> {
    const repository = getRepository(User);
    const user = await repository.findOne(currentUserId);
    if (!user?.email) {
      throw new ApolloError(
        USERS_ERRORS.USERNAME_EXISTS.MESSAGE,
        USERS_ERRORS.USERNAME_EXISTS.CODE,
      );
    }
    await this.kartraService.getUserKartra(user.email);
  }

  async getUserMember(id: number): Promise<UserProfile[]> {
    const repository = getRepository(User);
    const user = await repository.findOne(id);
    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    const davidUser =
      user.username !== 'david'
        ? await repository.findOne({ username: 'david' })
        : undefined;

    const recommendedUsers = await this.recommendationUsers.getRankMember(id);

    const users = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.id IN (:...recommendedUsers)', { recommendedUsers })
      .andWhere('user.registrationStatus = :status ', {
        status: RegistrationStatusEnum.COMPLETED,
      })
      .andWhere('user.username != :userDavid', { userDavid: 'david' })
      .getMany();

    if (davidUser) users.unshift(davidUser);

    return users;
  }

  async isAvailableCreateUser(): Promise<boolean> {
    const LIMIT_PER_DAY = 500;
    const day = new Date(Date.now());
    const today = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    const numberUserCreated = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.createdAt > :start_at', { start_at: `${today}  0:00:0` })
      .andWhere('user.registrationStatus = :status ', {
        status: RegistrationStatusEnum.CREATED,
      })
      .getCount();

    if (numberUserCreated <= LIMIT_PER_DAY) {
      return true;
    } else {
      return false;
    }
  }

  async verifyPublicKey(publicKey: string): Promise<boolean> {
    const repository = getRepository(User);

    const user = await repository
      .createQueryBuilder()
      .where({
        publicKey,
      })
      .getOne();

    if (!user) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }
    await repository.save({
      id: user.id,
      isPublicKeyVerified: true,
    });

    return true;
  }
}
