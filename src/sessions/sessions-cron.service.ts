import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getRepository } from 'typeorm';
import { Session } from './session.entity';
import ms from 'ms';

@Injectable()
export class SessionsCronService {
  @Cron('*/15 * * * *')
  async finishOpenedSessions(): Promise<void> {
    /* There is a timezone issue which causes sessions to get closed earlier

    const repository = getRepository(Session);

    const sessionsIds = await repository
      .createQueryBuilder()
      .select('s.id')
      .distinct(true)
      .from(Session, 's')
      .leftJoin('s.participantUsers', 'p')
      .where('s.finishedAt IS NULL')
      .andWhere('s.createdAt <= :date', {
        date: new Date(Date.now() - ms('60m')),
      })
      .andWhere('p.id IS NULL')
      .getMany();

    await repository.save(
      sessionsIds.map((session) => ({
        id: session.id,
        finishedAt: new Date(),
        participantUsers: [],
        greenRoomUsers: [],
        viewerUsers: [],
      })),
    );
    */
  }
}
