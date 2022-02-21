import { Team } from './team.entity';

export interface ITeamMembersIds {
  ids: number[];
  team: Team;
}

export enum TeamType {
  PRIVATE = "Private",
  PUBLIC = 'Public',
  SECRET = 'Secret',
}
