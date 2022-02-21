import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';
import { JWT_ERRORS } from './jwt.messages';

export enum JwtType {
  REGISTRATION = 'REGISTRATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SESSION_USER = 'SESSION_USER',
  SESSION_VIEWER = 'SESSION_VIEWER',
  SESSION_HOST = 'SESSION_HOST',
  RESET_PASSWORD = 'RESET_PASSWORD',
  CREATE_USER = 'CREATE_USER'
}

export interface BasePayload {
  [key: string]: any;
}

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  async sign(payload: BasePayload, type: JwtType): Promise<string> {
    const secret = this.configService.get('app.jwtSecret') as string;
    const expiresIn = this.getExpiration(type);

    try {
      return await new Promise((resolve, reject) => {
        jwt.sign(
          { ...payload, type },
          secret,
          {
            expiresIn,
          },
          (err, token) => (err ? reject(err) : resolve(token)),
        );
      });
    } catch (e) {
      throw new ApolloError(
        JWT_ERRORS.JWT_ISSUE_FAILED.MESSAGE,
        JWT_ERRORS.JWT_ISSUE_FAILED.CODE,
      );
    }
  }

  async verify(token: string, type: JwtType): Promise<BasePayload> {
    const secret = this.configService.get('app.jwtSecret') as string;
    let payload: BasePayload;

    try {
      payload = await new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err: Error | null, payload: BasePayload) =>
          err ? reject(err) : resolve(payload),
        );
      });
    } catch (e) {
      throw new ApolloError(
        JWT_ERRORS.JWT_INVALID_OR_EXPIRED.MESSAGE,
        JWT_ERRORS.JWT_INVALID_OR_EXPIRED.CODE,
      );
    }

    if (payload.type !== type) {
      throw new ApolloError(
        JWT_ERRORS.INVALID_JWT_TYPE.MESSAGE,
        JWT_ERRORS.INVALID_JWT_TYPE.CODE,
      );
    }

    return payload;
  }

  getExpiration(type: JwtType): string {
    switch (type) {
      case JwtType.REGISTRATION:
        return this.configService.get('app.registrationJwtExpire') as string;
      case JwtType.AUTHORIZATION:
        return this.configService.get('app.authorizationJwtExpire') as string;
      case JwtType.SESSION_USER:
      case JwtType.SESSION_VIEWER:
      case JwtType.SESSION_HOST:
        return this.configService.get('app.sessionJwtExpire') as string;
      case JwtType.RESET_PASSWORD:
        return this.configService.get('app.resetPasswordJwtExpire') as string;
      case JwtType.CREATE_USER:
        return '5m' as string;
      default:
        throw new ApolloError(
          JWT_ERRORS.INVALID_JWT_TYPE.MESSAGE,
          JWT_ERRORS.INVALID_JWT_TYPE.CODE,
        );
    }
  }
}
