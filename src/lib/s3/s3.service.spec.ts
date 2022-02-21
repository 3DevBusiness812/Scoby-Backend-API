import { Test, TestingModule } from '@nestjs/testing';
import { FileStreamInfo, S3Service } from './s3.service';
import Chance from 'chance';
import S3 from 'aws-sdk/clients/s3';
import { ConfigModule } from '@nestjs/config';
import { ReadStream } from 'fs';
import { Transform } from 'stream';
import { ApolloError } from 'apollo-server-express';
import { S3_ERRORS } from './s3.messages';

const chance = new Chance();
jest.mock('aws-sdk/clients/s3');

describe('S3Service', () => {
  let service: S3Service;
  let config: { aws: { s3UserProfileAssetsBucket: string } };
  let file: FileStreamInfo;

  function mockS3(func: 'upload' | 'deleteObjects', err?: any, res?: any) {
    jest.spyOn(service.s3, func).mockImplementation((): any => {
      return {
        async promise() {
          if (err) throw err;
          return res ?? { Key: chance.word() };
        },
      };
    });
  }

  beforeEach(async () => {
    config = {
      aws: {
        s3UserProfileAssetsBucket: chance.string(),
      },
    };

    file = {
      mime: 'image/png',
      name: chance.string(),
      extension: 'png',
      stream: (new Transform() as unknown) as ReadStream,
    };

    (S3 as any).mockImplementation(() => ({
      upload: () => ({
        promise: async () => undefined,
      }),
      deleteObjects: () => ({
        promise: async () => undefined,
      }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(() => config)],
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);

    mockS3('upload');
    mockS3('deleteObjects');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Upload Files', () => {
    it('should successfully upload file', async () => {
      const expected = { Key: chance.string() };
      mockS3('upload', null, expected);

      const res = await service.uploadFile(file);
      expect(res).toMatchObject(expected);
    });

    it('should fail to upload file', async () => {
      mockS3('upload', new Error());

      await expect(service.uploadFile(file)).rejects.toThrow(
        new ApolloError(
          S3_ERRORS.UPLOAD_FAILED.MESSAGE,
          S3_ERRORS.UPLOAD_FAILED.CODE,
        ),
      );
    });
  });

  describe('Delete Files', () => {
    it('should successfully delete files', async () => {
      await service.removeFiles([chance.string()]);
    });

    it('should fail to delete files', async () => {
      mockS3('deleteObjects', new Error());
      await expect(service.removeFiles([chance.string()])).rejects.toThrow(
        new ApolloError(
          S3_ERRORS.DELETE_FAILED.MESSAGE,
          S3_ERRORS.DELETE_FAILED.CODE,
        ),
      );
    });
  });
});
