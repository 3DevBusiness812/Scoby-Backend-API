import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import util from 'util';
import { ApolloError } from 'apollo-server-express';
import { SCRYPT_ERRORS } from './scrypt.messages';

@Injectable()
export class ScryptService {
  static readonly SALT_LENGTH = 32;
  static readonly KEY_LENGTH = 64;
  static readonly ENCODING = 'base64';

  static readonly scrypt = util.promisify(crypto.scrypt);
  static readonly randomBytes = util.promisify(crypto.randomBytes);

  async hash(password: string): Promise<string> {
    try {
      const pwdSalt = await ScryptService.randomBytes(
        ScryptService.SALT_LENGTH,
      );
      const pwdHash = (await ScryptService.scrypt(
        password,
        pwdSalt,
        ScryptService.KEY_LENGTH,
      )) as Buffer;

      return [
        pwdSalt.toString(ScryptService.ENCODING),
        pwdHash.toString(ScryptService.ENCODING),
      ].join('$');
    } catch (e) {
      throw new ApolloError(
        SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.MESSAGE,
        SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.CODE,
      );
    }
  }

  async verify(password: string, hash: string): Promise<void> {
    let verifyHash: Buffer;
    let pwdHash: Buffer;

    try {
      const [pwdSaltString, verifyHashString] = hash.split('$');
      const pwdSalt = Buffer.from(pwdSaltString, ScryptService.ENCODING);
      verifyHash = Buffer.from(verifyHashString, ScryptService.ENCODING);

      pwdHash = (await ScryptService.scrypt(
        password,
        pwdSalt,
        ScryptService.KEY_LENGTH,
      )) as Buffer;
    } catch (e) {
      throw new ApolloError(
        SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.MESSAGE,
        SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.CODE,
      );
    }

    if (!verifyHash.equals(pwdHash)) {
      throw new ApolloError(
        SCRYPT_ERRORS.INCORRECT_PASSWORD.MESSAGE,
        SCRYPT_ERRORS.INCORRECT_PASSWORD.CODE,
      );
    }
  }
}
