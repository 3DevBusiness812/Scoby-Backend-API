import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseConfig } from '../../config/firebase.config';
import fb from 'firebase-admin';

export interface NotificationMessage {
  title: string;
  body: string;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const config = this.configService.get('firebase') as FirebaseConfig;
    const serviceAccount = JSON.parse(
      Buffer.from(config.serviceAccount, 'base64').toString('utf8'),
    );

    fb.initializeApp({
      credential: fb.credential.cert(serviceAccount),
      databaseURL: config.databaseUrl,
    });
  }

  async sendNotification(
    token: string,
    notification: NotificationMessage,
  ): Promise<string> {
    return fb.messaging().send({
      notification,
      token,
    });
  }

  async sendMulticastNotification(
    tokens: string[],
    notification: NotificationMessage,
  ): Promise<fb.messaging.BatchResponse> {
    return fb.messaging().sendMulticast({
      notification,
      tokens,
    });
  }

  async sendAllNotifications(
    notifications: {
      token: string;
      notification: NotificationMessage;
    }[],
  ): Promise<fb.messaging.BatchResponse> {
    return fb.messaging().sendAll(notifications);
  }
}
