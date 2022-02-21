import { Test, TestingModule } from '@nestjs/testing';
import {
  ImageProcessorService,
  ImageTargetType,
} from './image-processor.service';
import { ConfigModule } from '@nestjs/config';
import sharp from 'sharp';
import { Transform } from 'stream';
import { ReadStream } from 'fs';

jest.mock('sharp');

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;
  let config: {
    app: {
      userAvatarMaxDimension: number;
      userBackgroundImageMaxDimension: number;
    };
  };
  let sharpMock: any;

  function mockSharp(func: 'resize' | 'toFormat', err?: any, res?: any) {
    jest.spyOn(sharpMock, func).mockImplementation((): any => {
      if (err) throw err;
      return res;
    });
  }

  beforeEach(async () => {
    config = {
      app: {
        userAvatarMaxDimension: 250,
        userBackgroundImageMaxDimension: 1000,
      },
    };

    sharpMock = {
      resize: () => sharpMock,
      toFormat: () => (new Transform() as unknown) as ReadStream,
    };

    (sharp as any).mockImplementation(() => sharpMock);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(() => config)],
      providers: [ImageProcessorService],
    }).compile();

    service = module.get<ImageProcessorService>(ImageProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Optimize Image', () => {
    it('should successfully return image stream and info', () => {
      service.optimizeImage(
        (new Transform() as unknown) as ReadStream,
        ImageTargetType.AVATAR,
      );
    });

    it('should throw error', () => {
      mockSharp('toFormat', new Error());

      expect(() => {
        service.optimizeImage(
          (new Transform() as unknown) as ReadStream,
          ImageTargetType.AVATAR,
        );
      }).toThrow();
    });
  });
});
