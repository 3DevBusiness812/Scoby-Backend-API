import { Injectable } from '@nestjs/common';
import { Topic } from './topic.entity';
import { getRepository, In } from 'typeorm';
import { ApolloError } from 'apollo-server-express';
import { TOPICS_ERRORS } from './topics.messages';

@Injectable()
export class TopicsService {
  async getTopics(): Promise<Topic[]> {
    const repository = getRepository(Topic);
    return repository.find({ order: { name: 'ASC' } });
  }

  async getTopicsOrFail(ids: number[]): Promise<Topic[]> {
    const repository = getRepository(Topic);
    const topics = await repository.find({
      where: {
        id: In(ids),
      },
    });

    const notFoundTopics = ids.filter(
      (id) => !topics.find((topic) => topic.id === id),
    );

    if (notFoundTopics.length) {
      throw new ApolloError(
        TOPICS_ERRORS.TOPIC_NOT_EXISTS.MESSAGE,
        TOPICS_ERRORS.TOPIC_NOT_EXISTS.CODE,
        { topics: notFoundTopics },
      );
    }

    return topics;
  }
}
