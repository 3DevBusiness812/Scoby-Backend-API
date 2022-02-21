import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import Joi from '@hapi/joi';
import { TEAM_ERRORS } from './team.messages';
import { TeamType } from './team.types';

@Injectable()
export class TeamCreationPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    switch (metadata.data) {
      case 'team': {
        await Joi.object({
          name: Joi.string().min(3).required(),
          description: Joi.string().min(3),
          topics: Joi.array()
            .items(Joi.number().integer().positive())
            .min(1)
            .unique(),
          invitedUsers: Joi.array()
            .items(Joi.number().integer().positive())
            .unique()
            .message(TEAM_ERRORS.UNIQUE_INVITED_USERS),
          membersAllowedToHost: Joi.boolean().required(),
          membersAllowedToInvite: Joi.boolean().required(),
          teamType: Joi.string().valid(TeamType.PRIVATE, TeamType.PUBLIC, TeamType.SECRET).required()
        }).validateAsync(value);
        break;
      }
    }
    return value;
  }
}
