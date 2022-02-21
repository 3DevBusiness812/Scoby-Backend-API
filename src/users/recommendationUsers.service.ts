import { Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { USERS_ERRORS } from './users.messages';
import axios from 'axios';
@Injectable()
export class RecommendationUsers {
  async getRankMember(id: number): Promise<number[]> {
    try {
      const { data } = await axios.get(
        `https://recommendation-api-dev-scoby.scoby.dev/rank_user/${id}`,
      );
      const map = new Map(Object.entries(data[0]));
      const users: any = map.get(`${id}`);
      return users;
    } catch (e) {
      console.error('Recommendation request failed', e);
      throw new ApolloError(
        USERS_ERRORS.REQUEST_FAILED.MESSAGE,
        USERS_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }
}
