import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-express';
import { UsersService } from './users.service';
import {
  UserProfile,
  UserVerificationExpire,
  UserProfileCreation,
  UserVerificationResult,
  UserLoginResult,
  UserProfileEdit,
  UserProfileWithAuth,
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
import {
  CheckBlackList,
  CreateLeadPipe,
  PhoneVerificationPipe,
  UpdatePasswordPipe,
  UserProfilePipe,
  UserProfileUpdatePipe,
} from './users.pipe';
import { UseGuards, UsePipes } from '@nestjs/common';
import { JwtGuard, createUserGuard } from '../lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { PagingPipe } from '../lib/common/common.pipe';
import { PagingInput } from '../lib/common/common.graphql';
import { Topic } from '../topics/topic.entity';
import { SessionsService } from '../sessions/sessions.service';

@Resolver(() => UserProfile)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  @Mutation(() => UserVerificationExpire)
  @UseGuards(createUserGuard)
  @UsePipes(PhoneVerificationPipe)
  async createUser(
    @Args('phone') phone: string,
  ): Promise<UserVerificationExpire> {
    return this.usersService.createUser(phone);
  }

  @Mutation(() => UserVerificationResult)
  @UsePipes(PhoneVerificationPipe)
  async verifyUserPhone(
    @Args('phone') phone: string,
    @Args('code') code: string,
  ): Promise<UserVerificationResult> {
    return this.usersService.verifyUserPhone(phone, code);
  }

  @Mutation(() => UserProfileWithAuth)
  @UsePipes(UserProfilePipe, CheckBlackList)
  async createUserProfile(
    @Args('profile') profile: UserProfileCreation,
  ): Promise<UserProfileWithAuth> {
    return this.usersService.createUserProfile(profile);
  }

  @Query(() => UserProfile)
  @UseGuards(JwtGuard)
  async getUserProfile(
    @CurrentUser() currentUser: BasePayload,
    @Args('id', { nullable: true }) userId?: number,
  ): Promise<UserProfile> {
    return this.usersService.getUserProfile(currentUser.id, userId);
  }

  @Query(() => RecommendationsData)
  @UseGuards(JwtGuard)
  async getRecommendationsData(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<RecommendationsData> {
    return this.usersService.getRecommendationsData(currentUser.id);
  }

  @Query(() => RecommendationsDataAllUsers)
  @UseGuards(JwtGuard)
  async getRecommendationsAllUsers(): Promise<RecommendationsDataAllUsers> {
    return this.usersService.getRecommendationsDataAllUsers();
  }

  @Query(() => GetUsersResult)
  @UsePipes(PagingPipe)
  async getUsers(
    @CurrentUser() currentUser: BasePayload | undefined,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
    @Args('query', { type: () => String, nullable: true }) query: string,
  ): Promise<GetUsersResult> {
    return this.usersService.getUsers(paging, currentUser?.id, query);
  }

  @Mutation(() => UserProfile)
  @UseGuards(JwtGuard)
  @UsePipes(UserProfileUpdatePipe, CheckBlackList)
  async updateUserProfile(
    @CurrentUser() currentUser: BasePayload,
    @Args('profile') profile: UserProfileEdit,
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(currentUser.id, profile);
  }

  @Mutation(() => UserLoginResult)
  async loginUser(
    @Args('phone') phone: string,
    @Args('password') password: string,
  ): Promise<UserLoginResult> {
    return this.usersService.loginUser(phone, password);
  }

  @Mutation(() => UserVerificationExpire)
  async loginUserName(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<UserVerificationExpire> {
    return await this.usersService.loginUserName(username, password);
  }

  @Mutation(() => UserLoginResult)
  async verificationCodeScobyGold(
    @Args('username') username: string,
    @Args('code') code: string,
  ): Promise<UserLoginResult> {
    return await this.usersService.verificationCodeScobyGold(code, username);
  }

  @Mutation(() => UserProfile)
  @UseGuards(JwtGuard)
  async uploadFile(
    @CurrentUser() currentUser: BasePayload,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<UserProfile> {
    return this.usersService.uploadFile(
      currentUser.id,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => UserVerificationExpire)
  @UsePipes(PhoneVerificationPipe)
  async resetPassword(
    @Args('phone') phone: string,
  ): Promise<UserVerificationExpire> {
    return this.usersService.resetPassword(phone);
  }

  @Mutation(() => ResetPasswordVerificationResult)
  @UsePipes(PhoneVerificationPipe)
  async confirmResetPassword(
    @Args('phone') phone: string,
    @Args('code') code: string,
  ): Promise<ResetPasswordVerificationResult> {
    return this.usersService.confirmResetPassword(phone, code);
  }

  @Mutation(() => UserProfileWithAuth)
  @UsePipes(UpdatePasswordPipe)
  async updatePassword(
    @Args('passwordResetToken') passwordResetToken: string,
    @Args('password') password: string,
  ): Promise<UserProfileWithAuth> {
    return this.usersService.updatePassword(passwordResetToken, password);
  }

  @Mutation(() => UserProfile)
  @UseGuards(JwtGuard)
  markUserInappropriate(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId') userId: number,
  ): Promise<UserProfile> {
    return this.usersService.markUserInappropriate(currentUser.id, userId);
  }

  @Query(() => [UserProfile])
  @UseGuards(JwtGuard)
  getInappropriateUsers(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<UserProfile[]> {
    return this.usersService.getInappropriateUsers(currentUser.id);
  }

  @Mutation(() => LeadCreationResult)
  @UsePipes(CreateLeadPipe)
  async createLead(
    @Args('registrationToken') registrationToken: string,
    @Args('lead') lead: LeadCreation,
  ): Promise<LeadCreationResult> {
    return this.usersService.createLead(registrationToken, lead);
  }

  @Query(() => InappropriateCheckResult)
  @UseGuards(JwtGuard)
  async checkInappropriateUser(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId') userId: number,
  ): Promise<InappropriateCheckResult> {
    return this.usersService.checkInappropriateUser(currentUser.id, userId);
  }

  @ResolveField('topics', () => [Topic])
  async topics(@Parent() userProfile: UserProfile): Promise<Topic[]> {
    return this.usersService.getUserTopics(userProfile.id);
  }

  @Mutation(() => UserProfile)
  @UseGuards(JwtGuard)
  async followUser(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId') userId: number,
  ): Promise<UserProfile> {
    return this.usersService.followUser(currentUser.id, userId);
  }

  @Mutation(() => UserProfile)
  @UseGuards(JwtGuard)
  async unfollowUser(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId') userId: number,
  ): Promise<UserProfile> {
    return this.usersService.unfollowUser(currentUser.id, userId);
  }

  @Query(() => GetUsersResult)
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getFollowerUsers(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId', { nullable: true }) userId: number,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<GetUsersResult> {
    return this.usersService.getFollowerUsers(userId ?? currentUser.id, paging);
  }

  @Query(() => GetUsersResult)
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getFollowingUsers(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId', { nullable: true }) userId: number,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<GetUsersResult> {
    return this.usersService.getFollowingUsers(
      userId ?? currentUser.id,
      paging,
    );
  }

  @Mutation(() => UserVerificationResult)
  async createTokenRegister(
    @Args('token') token: string,
  ): Promise<UserVerificationResult> {
    return this.usersService.createTokenRegister(token);
  }

  @ResolveField('followCounts', () => FollowCounts)
  async followCounts(
    @Parent() userProfile: UserProfile,
  ): Promise<FollowCounts> {
    return this.usersService.getFollowCounts(userProfile);
  }

  @ResolveField('followStats', () => FollowStats)
  async followStats(
    @Parent() userProfile: UserProfile,
    @CurrentUser() currentUser: BasePayload | undefined,
  ): Promise<FollowStats> {
    return this.usersService.getFollowStats(userProfile, currentUser?.id);
  }

  @Mutation(() => LeadSuscriptionList)
  async kartraUserSuscription(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<LeadSuscriptionList> {
    return this.usersService.kartraUserSuscription({ name, email });
  }

  @UseGuards(JwtGuard)
  @Mutation(() => SuscribeLeadCalendar)
  async kartraSuscribeLeadCalendar(
    @CurrentUser() currentUser: BasePayload,
    @Args('nameCalendar') name: string,
    @Args('className') className: string,
  ): Promise<SuscribeLeadCalendar> {
    return this.usersService.kartraSuscribeLeadCalendar(
      currentUser.id,
      name,
      className,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => SuscribeLeadCalendar)
  async kartraCreateLeadCalendar(
    @CurrentUser() currentUser: BasePayload,
    @Args('nameCalendar') name: string,
    @Args('className') className: string,
  ): Promise<SuscribeLeadCalendar> {
    return this.usersService.kartraCreateCalendar(
      currentUser.id,
      name,
      className,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => SuscribeLeadCalendar)
  async kartraUnSuscribeCalendar(
    @CurrentUser() currentUser: BasePayload,
    @Args('calendarId') calendarId: number,
  ): Promise<SuscribeLeadCalendar> {
    return this.usersService.kartraUnSuscribeCalendar(
      currentUser.id,
      calendarId,
    );
  }

  @Mutation(()=>Boolean)
  async verifyPublicKey(
    @Args('publicKey') publicKey:string
  ):Promise<boolean>{
    return this.usersService.verifyPublicKey(publicKey);
  }
}
