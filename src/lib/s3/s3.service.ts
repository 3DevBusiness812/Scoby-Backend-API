import { Injectable } from '@nestjs/common';
import S3 from 'aws-sdk/clients/s3';
import { ConfigService } from '@nestjs/config';
import { S3_ERRORS } from './s3.messages';
import { ApolloError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

export interface FileStreamInfo {
  name?: string;
  extension?: string;
  mime: string;
  stream: Readable;
}

@Injectable()
export class S3Service {
  readonly s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: configService.get('aws.accessKeyId') as string,
      secretAccessKey: configService.get('aws.secretAccessKey') as string,
      region: configService.get('aws.region') as string,
    });
  }

  async uploadFile(file: FileStreamInfo): Promise<S3.ManagedUpload.SendData> {
    let extension = '';

    if (file.extension) {
      extension = `.${file.extension}`;
    } else if (file.name) {
      const filenameParts = file.name.split('.');
      extension =
        filenameParts.length > 1
          ? `.${filenameParts[filenameParts.length - 1]}`
          : '';
    }

    try {
      return await this.s3
        .upload({
          Body: file.stream,
          Bucket: this.configService.get(
            'aws.s3UserProfileAssetsBucket',
          ) as string,
          Key: uuidv4() + extension,
          ContentType: file.mime,
          ACL: 'public-read',
        })
        .promise();
    } catch (e) {
      throw new ApolloError(
        S3_ERRORS.UPLOAD_FAILED.MESSAGE,
        S3_ERRORS.UPLOAD_FAILED.CODE,
      );
    }
  }

  async removeFiles(files: string[]): Promise<void> {
    try {
      await this.s3
        .deleteObjects({
          Bucket: this.configService.get(
            'aws.s3UserProfileAssetsBucket',
          ) as string,
          Delete: {
            Objects: files.map((fileName) => ({ Key: fileName })),
            Quiet: true,
          },
        })
        .promise();
    } catch (e) {
      throw new ApolloError(
        S3_ERRORS.DELETE_FAILED.MESSAGE,
        S3_ERRORS.DELETE_FAILED.CODE,
      );
    }
  }
}
