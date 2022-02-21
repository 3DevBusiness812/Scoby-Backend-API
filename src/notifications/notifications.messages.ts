import { Series } from 'src/series/series.entity';
import { NotificationMessage } from '../lib/firebase/firebase.service';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { Team } from 'src/team/team.entity';
import { UserProfile } from 'src/users/users.graphql';
import { Event } from 'src/events/events.entity';

export const notificationsParamsMessages = {
  userStartedSession: (
    session: Session,
    owner: User,
    recipient: User,
  ): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;

    return {
      title: `Invitation to ${session.title} from ${hostInfo}`,
      body: `Hey ${recipientInfo}! ${hostInfo} invites you to join their Session "${session.title}" Enjoy!`,
    };
  },
  newChatMessage: (sender: User, message: string): NotificationMessage => {
    return {
      title: `You have received a new message from @${sender.username}`,
      body: message,
    };
  },

  userStartedFollow: (owner: User, recipient: User): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;

    return {
      title: `Hey ${recipientInfo}!`,
      body: `${hostInfo} has started following you`,
    };
  },
  userStartedSerie: (
    serie: Series,
    owner: User,
    recipient: User,
  ): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;

    return {
      title: `Invitation to ${serie.calendarName} from ${hostInfo}`,
      body: `Hey ${recipientInfo}! ${hostInfo} invites you to join their Serie "${serie.calendarName}" Enjoy!`,
    };
  },
  userStartedTeam: (
    team: Team,
    owner: User | UserProfile,
    recipient: User,
  ): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;
    return {
      title: `Invitation to ${team.name} from ${hostInfo}`,
      body: `Hey ${recipientInfo}! ${hostInfo} invites you to join their Team "${team.name}" Enjoy!`,
    };
  },
  userUpdateTeamType: (
    team: Team,
    owner: User,
    recipient: User,
    updatedTeamType: string,
  ): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;
    const teamName = team.name;

    return {
      title: `Hey ${recipientInfo}`,
      body: `${hostInfo} has changed the team ${teamName} from ${team.teamType} to ${updatedTeamType}`,
    };
  },
  ownerApplication: (
    team: Team,
    requester: User | UserProfile,
    receiver: User,
  ): NotificationMessage => {
    const hostInfo = requester.fullName || `@${requester.username}`;
    const recipientInfo = receiver.fullName || `@${receiver.username}`;
    const teamName = team.name;

    return {
      title: `Hey ${recipientInfo}`,
      body: `${hostInfo} wants to join to ${teamName}`,
    };
  },
  userStartedEvent: (
    event: Event,
    owner: User,
    recipient: User,
  ): NotificationMessage => {
    const hostInfo = owner.fullName || `@${owner.username}`;
    const recipientInfo = recipient.fullName || `@${recipient.username}`;

    return {
      title: `Invitation to ${event.title} from ${hostInfo}`,
      body: `Hey ${recipientInfo}! ${hostInfo} invites you to join their Event "${event.title}" Enjoy!`,
    };
  },
};
