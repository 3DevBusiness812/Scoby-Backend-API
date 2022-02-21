import { Injectable } from '@nestjs/common';
import { getRepository, getConnection } from 'typeorm';
import { Activity } from './activity.entity';
import { ActivityRead } from './activity-read.entity';
import { Paging } from '../lib/common/common.interfaces';
import { getActivity, ActivityCounter } from './activity.graphql';
import { ACTIVITY_ERRORS } from './activity.messages';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class ActivityServices {
  async getActivity(
    currentUserId: number,
    paging: Paging,
  ): Promise<getActivity> {
    const activity = await getRepository(Activity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.sourceUser', 'sourceUser')
      .where('user.targetUser = :currentUserId', { currentUserId })
      .orderBy('user.createdAt', 'DESC');

    const total = await activity.getCount();
    const users = await activity
      .skip(paging.limit * (paging.page - 1))
      .take(paging.limit)
      .getMany();

    return {
      data: users,
      paging: { page: paging.page, limit: paging.limit, total },
    };
  }

  async deleteCounterActivity(currentUserId: number): Promise<ActivityCounter> {
    const activity = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(ActivityRead)
      .where('idUser = :currentUserId', { currentUserId })
      .execute();

    if (activity.affected === undefined) {
      throw new ApolloError(
        ACTIVITY_ERRORS.ACTIVITY_NOT_DELETE.MESSAGE,
        ACTIVITY_ERRORS.ACTIVITY_NOT_DELETE.CODE,
      );
    }

    return { counter: activity.affected || 0 };
  }

  async getCounterActivity(currentUserId: number): Promise<ActivityCounter> {
    const activity = await getRepository(ActivityRead)
      .createQueryBuilder('activity')
      .where('activity.idUser = :currentUserId', { currentUserId })
      .getCount();

    return { counter: activity };
  }

  async sendGroupNotificationActivity(
    invitedUsers?: number[] | null,
    procedureAction?: number,
    currentUserId?: number,
    typeAction?: string,
    additionalPayload?: string,
  ): Promise<void> {
    const usersForActivitys =
      invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];
    const createdAt = new Date(Date.now());
    for await (const userId of usersForActivitys) {
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
          type_action: typeAction,
          procedure_action: procedureAction,
          createdAt: createdAt,
          additionalPayload,
        })
        .orIgnore()
        .execute();
    }
  }
}
