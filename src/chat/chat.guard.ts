import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-errors';
import { JWT_ERRORS } from 'src/lib/jwt/jwt.messages';
import { JwtService, JwtType } from 'src/lib/jwt/jwt.service';
import { ChatService } from './chat.service';

@Injectable()
export class MessageGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  async roomCheck(roomId: number, userId: number): Promise<boolean> {
    const users = await this.chatService.getChatParticipants(roomId);
    return users.map(({ id }) => id).some((item) => item === userId);
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
    
    const roomId = ctx.getArgByIndex(1).room;
    const check = await this.roomCheck(roomId, user.id);
    
    return check;
  }
}
