import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SNS from 'aws-sdk/clients/sns';
import { ApolloError } from 'apollo-server-express';
import { SMS_ERRORS } from './sms.messages';

@Injectable()
export class SmsService implements OnModuleInit {
  readonly sns: SNS;
  private readonly logger = new Logger(SmsService.name)

  constructor(private configService: ConfigService) {
    this.sns = new SNS({
      accessKeyId: configService.get('aws.accessKeyId') as string,
      secretAccessKey: configService.get('aws.secretAccessKey') as string,
      region: configService.get('aws.region') as string,
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get('aws.disableSmsSending')) return;

    await this.sns
      .setSMSAttributes({
        attributes: {
          DefaultSenderID: this.configService.get('aws.snsSenderId') as string,
          DefaultSMSType: 'Transactional',
        },
      })
      .promise();
  }

  async sendMessage(
    phone: string,
    message: string,
  ): Promise<SNS.Types.PublishResponse> {
    if (this.configService.get('aws.disableSmsSending')) {
      this.logger.log(phone, message);
      return { MessageId: '' };
    }

    try {
      return await this.sns
        .publish({
          Message: message,
          PhoneNumber: phone,
        })
        .promise();
    } catch (e) {
      throw new ApolloError(
        SMS_ERRORS.MESSAGE_SEND_FAILED.MESSAGE,
        SMS_ERRORS.MESSAGE_SEND_FAILED.CODE,
      );
    }
  }
}
