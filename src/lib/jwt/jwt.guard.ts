import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService, JwtType } from './jwt.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { JWT_ERRORS } from './jwt.messages';
import { USERS_ERRORS } from 'src/users/users.messages';
import { isValidPhoneNumber } from 'libphonenumber-js';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.req) return true;

    const authHeaderContent =
      ctx.req.headers['authorization'] ?? ctx.req.headers['Authorization'];

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

    ctx.req.user = await this.jwtService.verify(token, JwtType.AUTHORIZATION);
    return true;
  }
}

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.req) return true;

    const authHeaderContent =
      ctx.req.headers['authorization'] ?? ctx.req.headers['Authorization'];

    if (!authHeaderContent) return true;

    const [headerType, token] = authHeaderContent.split(' ');

    if (headerType !== 'Bearer') {
      throw new ApolloError(
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.MESSAGE,
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.CODE,
      );
    }

    ctx.req.user = await this.jwtService.verify(token, JwtType.AUTHORIZATION);
    return true;
  }
}

@Injectable()
export class createUserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const { phone } = GqlExecutionContext.create(context).getArgByIndex(1);

    const authHeaderContent =
      ctx.req.headers['authorization'] ?? ctx.req.headers['Authorization'];

    const [headerType, token] = authHeaderContent.split(' ');

    if (headerType !== 'Bearer') {
      throw new ApolloError(
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.MESSAGE,
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.CODE,
      );
    }

    const isValidPhone = isValidPhoneNumber(phone);
    if (!isValidPhone) {
      throw new ApolloError(
        USERS_ERRORS.WRONG_PHONE_NUMBER.MESSAGE,
        USERS_ERRORS.WRONG_PHONE_NUMBER.CODE,
      );
    }
    await this.jwtService.verify(token, JwtType.CREATE_USER);

    return true;
  }
}
