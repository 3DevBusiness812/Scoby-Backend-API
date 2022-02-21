import { Test, TestingModule } from '@nestjs/testing';
import { ScryptService } from './scrypt.service';
import Chance from 'chance';
import { ApolloError } from 'apollo-server-express';
import { SCRYPT_ERRORS } from './scrypt.messages';

const chance = new Chance();

describe('ScryptService', () => {
  let service: ScryptService;
  let password: string;

  function stubScrypt(err?: any, res?: any) {
    jest.spyOn(ScryptService, 'scrypt').mockImplementation(async () => {
      if (err) throw err;
      return res;
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScryptService],
    }).compile();

    service = module.get<ScryptService>(ScryptService);
    password = chance.word();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Scrypt Hash', () => {
    it('should successfully hash password', async () => {
      const hash = await service.hash(password);
      expect(typeof hash).toBe('string');
      const [pwdSalt, pwdHash] = hash.split('$');
      expect(typeof pwdSalt).toBe('string');
      expect(typeof pwdHash).toBe('string');
    });

    it('should fail to hash password', async () => {
      stubScrypt(new Error());
      await expect(service.hash(password)).rejects.toThrow(
        new ApolloError(
          SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.MESSAGE,
          SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.CODE,
        ),
      );
    });
  });

  describe('Scrypt Verify', () => {
    it('should successfully verify password', async () => {
      const hash = await service.hash(password);
      await service.verify(password, hash);
    });

    it('should fail to verify password', async () => {
      const hash = await service.hash(password);
      stubScrypt(new Error());
      await expect(service.verify(password, hash)).rejects.toThrow(
        new ApolloError(
          SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.MESSAGE,
          SCRYPT_ERRORS.PASSWORD_PROCESSING_FAILED.CODE,
        ),
      );
    });

    it('should fail to verify incorrect password', async () => {
      const hash = await service.hash(password);
      await expect(
        service.verify(password + chance.word(), hash),
      ).rejects.toThrow(
        new ApolloError(
          SCRYPT_ERRORS.INCORRECT_PASSWORD.MESSAGE,
          SCRYPT_ERRORS.INCORRECT_PASSWORD.CODE,
        ),
      );
    });
  });
});
