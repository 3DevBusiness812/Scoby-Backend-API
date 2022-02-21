import { Query, Resolver } from '@nestjs/graphql';
import { Topic } from './topics.graphql';
import { TopicsService } from './topics.service';

@Resolver('Topics')
export class TopicsResolver {
  constructor(private topicsService: TopicsService) {}

  @Query(() => [Topic])
  async getTopics(): Promise<Topic[]> {
    return this.topicsService.getTopics();
  }
}
