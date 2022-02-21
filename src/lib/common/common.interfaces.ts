import { GqlExecutionContext } from '@nestjs/graphql';
import { ReadStream } from 'fs';
import { BasePayload } from '../jwt/jwt.service';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
}

export interface Paging {
  page: number;
  limit: number;
}

export interface IJwtGuard {
  user: BasePayload;
  ctx: GqlExecutionContext;
}
