import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { ReadStream } from 'fs';
import { ApolloError } from 'apollo-server-express';
import { IMAGE_PROCESSOR_ERRORS } from './image-processor.messages';

export interface ResizeConfig {
  width?: number;
  height?: number;
  withoutEnlargement?: boolean;
}

export interface OutputConfig {
  format: string;
  extension: string;
  mime: string;
  options?: {
    quality?: number;
  };
}

export interface OptimizedImageInfo {
  extension: string;
  mime: string;
  stream: Readable;
}

export enum ImageTargetType {
  AVATAR,
  BACKGROUND_IMAGE,
}

@Injectable()
export class ImageProcessorService {
  constructor(private configService: ConfigService) {}

  optimizeImage(
    imageStream: ReadStream,
    targetType: ImageTargetType,
  ): OptimizedImageInfo {
    const resizeConfig = this.getResizeConfig(targetType);
    const outputConfig = this.getOutputConfig(targetType);

    const pipeline = sharp()
      .resize(resizeConfig)
      .toFormat(outputConfig.format, outputConfig.options);

    imageStream.pipe(pipeline);
    return {
      stream: pipeline,
      extension: outputConfig.extension,
      mime: outputConfig.mime,
    };
  }

  getResizeConfig(targetType: ImageTargetType): ResizeConfig {
    switch (targetType) {
      case ImageTargetType.AVATAR: {
        return {
          width: this.configService.get('app.userAvatarMaxDimension'),
          height: this.configService.get('app.userAvatarMaxDimension'),
          withoutEnlargement: true,
        };
      }
      case ImageTargetType.BACKGROUND_IMAGE: {
        return {
          width: this.configService.get('app.userBackgroundImageMaxDimension'),
          height: this.configService.get('app.userBackgroundImageMaxDimension'),
          withoutEnlargement: true,
        };
      }
      default: {
        throw new ApolloError(
          IMAGE_PROCESSOR_ERRORS.IMAGE_PROCESSING_FAILED.MESSAGE,
          IMAGE_PROCESSOR_ERRORS.IMAGE_PROCESSING_FAILED.CODE,
        );
      }
    }
  }

  getOutputConfig(targetType: ImageTargetType): OutputConfig {
    switch (targetType) {
      case ImageTargetType.AVATAR:
      case ImageTargetType.BACKGROUND_IMAGE: {
        return {
          format: 'jpeg',
          extension: 'jpg',
          mime: 'image/jpeg',
          options: {
            quality: 80,
          },
        };
      }
      default: {
        throw new ApolloError(
          IMAGE_PROCESSOR_ERRORS.IMAGE_PROCESSING_FAILED.MESSAGE,
          IMAGE_PROCESSOR_ERRORS.IMAGE_PROCESSING_FAILED.CODE,
        );
      }
    }
  }
}
