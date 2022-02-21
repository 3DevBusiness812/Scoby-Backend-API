import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';
import Chance from 'chance';
import { ApolloError } from 'apollo-server-express';
import { SMS_ERRORS } from './sms.messages';
import SNS from 'aws-sdk/clients/sns';

jest.mock('aws-sdk/clients/sns');
const chance = new Chance();

describe('SmsService', () => {
  let service: SmsService;
  let config: { aws: { accessKeyId: string; secretAccessKey: string } };

  function mockSnsPublish(err?: any, res?: any) {
    jest.spyOn(service.sns, 'publish').mockImplementation((): any => {
      return {
        async promise() {
          if (err) throw err;
          return res ?? { MessageId: chance.word() };
        },
      };
    });
  }

  beforeEach(async () => {
    config = {
      aws: {
        accessKeyId: chance.word(),
        secretAccessKey: chance.word(),
      },
    };

    (SNS as any).mockImplementation(() => ({
      setSMSAttributes: () => ({
        promise: async () => undefined,
      }),
      publish: () => ({
        promise: async () => undefined,
      }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(() => config)],
      providers: [SmsService],
    }).compile();

    service = module.get<SmsService>(SmsService);

    mockSnsPublish();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('SMS Send Message', () => {
    it('should successfully send sms message', async () => {
      const expected = { MessageId: chance.word() };
      mockSnsPublish(null, expected);

      const res = await service.sendMessage(chance.phone(), chance.sentence());
      expect(res).toMatchObject(expected);
    });

    it('should fail to send sms message', async () => {
      mockSnsPublish(new Error());

      await expect(
        service.sendMessage(chance.phone(), chance.sentence()),
      ).rejects.toThrow(
        new ApolloError(
          SMS_ERRORS.MESSAGE_SEND_FAILED.MESSAGE,
          SMS_ERRORS.MESSAGE_SEND_FAILED.CODE,
        ),
      );
    });
  });
});
