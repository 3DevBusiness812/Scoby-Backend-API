import { Injectable } from '@nestjs/common';
import { OpentokConfig } from 'src/config/opentok.config';
import { ConfigService } from '@nestjs/config';
import { getRepository } from 'typeorm';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import OpenTok from 'opentok';

@Injectable()
export class VonageService {
  opentok: any;

  constructor(private configService: ConfigService) {
    const config = this.configService.get('opentok') as OpentokConfig;

    this.opentok = new OpenTok(config.API_KEY, config.API_SECRET);
  }

  async createSession(
    currentUserId: number,
    sessionId: number,
  ): Promise<any> {
    const sessionRepository = getRepository(Session);
    const userRepository = getRepository(User);
    const opts = { mediaMode:'routed', archiveMode:'manual' };
    const callback = (resolve: any) => async (err: any, session: any) => {
      if (err) {
        console.log(err);
        return err;
      }

      const vonageSessionToken = session.sessionId;
      const vonageUserToken = this.generateVonageTokenByRole(vonageSessionToken, 'moderator');

      await userRepository.save({ id: currentUserId, vonageUserToken });
      await sessionRepository.save({ id: sessionId, vonageSessionToken });

      resolve({ vonageSessionToken, vonageUserToken });
    };

    return await new Promise((resolve) => this.opentok.createSession(opts, callback(resolve)));
  }

  async viewSession(currentUserId: number, vonageSessionToken: string): Promise<string> {
    const userRepository = getRepository(User);
    const vonageUserToken = this.generateVonageTokenByRole(vonageSessionToken, 'publisher');

    await userRepository.save({ id: currentUserId, vonageUserToken });

    return vonageUserToken;
  }

  async joinSession(currentUserId: number, vonageSessionToken: string) {
    const userRepository = getRepository(User);
    const vonageUserToken = this.generateVonageTokenByRole(vonageSessionToken, 'publisher');

    await userRepository.save({ id: currentUserId, vonageUserToken });

    return vonageUserToken;
  }

  generateVonageTokenByRole(sessionToken: string, role: string): string {
    const expireTime = (new Date().getTime() / 1000) + (60 * 60);
    const data = `role=${role}`;

    return this.opentok.generateToken(sessionToken, { role, expireTime, data });
  }
}
