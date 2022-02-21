import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtType } from './jwt.service';
import { ConfigModule } from '@nestjs/config';
import Chance from 'chance';
import jwt from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';
import { JWT_ERRORS } from './jwt.messages';

const chance = new Chance();

describe('JwtService', () => {
  let service: JwtService;
  let config: { app: { jwtSecret: string; registrationJwtExpire: string } };

  function stubJwtSign(err?: any, res?: any) {
    jest.spyOn(jwt, 'sign').mockImplementation((...args) => {
      const cb = (args[args.length - 1] as unknown) as (
        err: any,
        res: any,
      ) => void;
      cb(err, res);
    });
  }

  beforeEach(async () => {
    config = {
      app: {
        jwtSecret: chance.word(),
        registrationJwtExpire: '30d',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(() => config)],
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('JWT Issue', () => {
    it('should successfully issue JWT', async () => {
      const token = await service.sign(
        { id: chance.guid() },
        JwtType.REGISTRATION,
      );
      expect(typeof token).toBe('string');
    });

    it('should fail to issue JWT', async () => {
      stubJwtSign(new Error());
      await expect(
        service.sign({ id: chance.guid() }, JwtType.REGISTRATION),
      ).rejects.toThrow(
        new ApolloError(
          JWT_ERRORS.JWT_ISSUE_FAILED.MESSAGE,
          JWT_ERRORS.JWT_ISSUE_FAILED.CODE,
        ),
      );
    });
  });

  describe('JWT Verify', () => {
    it('should successfully verify JWT', async () => {
      const token = await service.sign(
        { id: chance.guid() },
        JwtType.REGISTRATION,
      );
      await service.verify(token, JwtType.REGISTRATION);
    });

    it('should fail to verify JWT when it is invalid', async () => {
      const token = await service.sign(
        { id: chance.guid() },
        JwtType.REGISTRATION,
      );
      await expect(
        service.verify(token + chance.word(), JwtType.REGISTRATION),
      ).rejects.toThrow(
        new ApolloError(
          JWT_ERRORS.JWT_INVALID_OR_EXPIRED.MESSAGE,
          JWT_ERRORS.JWT_INVALID_OR_EXPIRED.CODE,
        ),
      );
    });

    it('should fail to verify JWT when it is expired', async () => {
      config.app.registrationJwtExpire = '0d';

      const token = await service.sign(
        { id: chance.guid() },
        JwtType.REGISTRATION,
      );

      await expect(service.verify(token, JwtType.REGISTRATION)).rejects.toThrow(
        new ApolloError(
          JWT_ERRORS.JWT_INVALID_OR_EXPIRED.MESSAGE,
          JWT_ERRORS.JWT_INVALID_OR_EXPIRED.CODE,
        ),
      );
    });

    it('should fail to verify JWT when wrong JWT type is provided', async () => {
      const token = await service.sign(
        { id: chance.guid() },
        JwtType.REGISTRATION,
      );
      await expect(
        service.verify(token, JwtType.AUTHORIZATION),
      ).rejects.toThrow(
        new ApolloError(
          JWT_ERRORS.INVALID_JWT_TYPE.MESSAGE,
          JWT_ERRORS.INVALID_JWT_TYPE.CODE,
        ),
      );
    });
  });
});
