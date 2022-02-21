import { Injectable } from '@nestjs/common';
import { PushToken } from './push-token.entity';
import { FindConditions, getRepository } from 'typeorm';

@Injectable()
export class PushTokensService {
  async addPushToken(
    currentUserId: number,
    deviceId: string,
    token: string,
  ): Promise<PushToken> {
    const repository = getRepository(PushToken);

    await repository
      .createQueryBuilder()
      .delete()
      .from(PushToken)
      .where('deviceId = :deviceId', { deviceId })
      .orWhere('token = :token', { token })
      .execute();

    return repository.save({
      deviceId,
      token,
      user: { id: currentUserId },
    });
  }

  async *pushTokensGenerator(
    query?: FindConditions<PushToken>,
    withUser = false,
    bulkSize = 500,
  ): AsyncGenerator<PushToken[]> {
    const repository = getRepository(PushToken);
    let page = 1;
    let pushTokens;

    do {
      pushTokens = await repository.find({
        take: bulkSize,
        skip: bulkSize * (page - 1),
        where: query,
        order: { id: 'ASC' },
        relations: withUser ? ['user'] : [],
      });
      if (pushTokens.length) yield pushTokens;
      page++;
    } while (pushTokens.length);
  }
}
