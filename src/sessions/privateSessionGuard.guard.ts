import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { JWT_ERRORS } from 'src/lib/jwt/jwt.messages';
import { JwtService, JwtType } from 'src/lib/jwt/jwt.service';
import { getRepository } from 'typeorm';
import { Session } from './session.entity';
import { SESSIONS_ERRORS } from './sessions.messages';

@Injectable()
export class PrivateSessionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private sessionAllowedUsers(session: Session): Array<number> {
    const usersArray = session?.invitedUsers?.map(({ id }) => id) as number[];
    usersArray?.push(session?.ownerUser.id as number);
    return usersArray;
  }

  private isUserAllowedToJoin(
    allowedUser: number[],
    currentUserId: number,
  ): boolean {
    return allowedUser.some((id) => id === currentUserId);
  }

  private async checkUserAccess(
    sessionId: number,
    userId: number,
  ): Promise<boolean> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['ownerUser', 'invitedUsers'],
    });

    const allowedUser = this.sessionAllowedUsers(session as Session);

    const isUserAllowedToJoin = this.isUserAllowedToJoin(allowedUser, userId);

    if (session?.isPrivate && !isUserAllowedToJoin) {
      throw new ApolloError(
        SESSIONS_ERRORS.ACCESS_RESTRICTED.MESSAGE,
        SESSIONS_ERRORS.ACCESS_RESTRICTED.CODE,
      );
    }

    return isUserAllowedToJoin;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const authHeaderContent =
      ctx.getContext().req?.headers['authorization'] ??
      ctx.getContext().req?.headers['Authorization'];

    if (!authHeaderContent) {
      throw new ApolloError(
        JWT_ERRORS.UNAUTHORIZED.MESSAGE,
        JWT_ERRORS.UNAUTHORIZED.CODE,
      );
    }

    const [headerType, token] = authHeaderContent.split(' ');

    if (headerType !== 'Bearer') {
      throw new ApolloError(
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.MESSAGE,
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.CODE,
      );
    }

    const user = await this.jwtService.verify(token, JwtType.AUTHORIZATION);
    ctx.getContext().req.user = user;

    const { id, userId } = ctx.getArgByIndex(1);

    this.checkUserAccess(id, userId);

    const check = this.checkUserAccess(id, userId);

    return check;
  }
}
