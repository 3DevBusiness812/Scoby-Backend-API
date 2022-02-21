import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { USERS_VALIDATION_MESSAGES } from './users.messages';
import Joi from '@hapi/joi';
import { ConfigService } from '@nestjs/config';
import { UserProfile } from './users.graphql';

@Injectable()
export class PhoneVerificationPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    switch (metadata.data) {
      case 'phone': {
        await Joi.string()
          .label(metadata.data)
          .pattern(/^\+[0-9]{1,3}[0-9]{8,12}$/)
          .message(USERS_VALIDATION_MESSAGES.PHONE_PATTERN)
          .validateAsync(value);
        break;
      }
      case 'code': {
        await Joi.string()
          .label(metadata.data)
          .pattern(/^[0-9]{4}$/)
          .message(USERS_VALIDATION_MESSAGES.VERIFICATION_CODE_PATTERN)
          .validateAsync(value);
        break;
      }
    }

    return value;
  }
}

@Injectable()
export class UserProfilePipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  async transform(value: unknown): Promise<unknown> {
    const currentDate = new Date();
    const maxBirthdayDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear() - this.configService.get('app.minUserAge'),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
      ),
    );

    await Joi.object({
      username: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z0-9._\-]{2,}$/)
        .message(USERS_VALIDATION_MESSAGES.USERNAME_PATTERN),
      password: Joi.string()
        .min(8)
        .max(20)
        .pattern(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
        .message(USERS_VALIDATION_MESSAGES.PASSWORD_PATTERN),
      birthday: Joi.date().max(maxBirthdayDate),
      topics: Joi.array().items(Joi.number().integer().positive()).min(1),
    })
      .options({ allowUnknown: true })
      .validateAsync(value);
    return value;
  }
}

@Injectable()
export class UserProfileUpdatePipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  async transform(value: unknown): Promise<unknown> {
    const currentDate = new Date();
    const maxBirthdayDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear() - this.configService.get('app.minUserAge'),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
      ),
    );

    await Joi.object({
      username: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z0-9._\-]{2,}$/)
        .message(USERS_VALIDATION_MESSAGES.USERNAME_PATTERN),
      birthday: Joi.date().max(maxBirthdayDate),
      topics: Joi.array().items(Joi.number().integer().positive()).min(1),
    })
      .options({ allowUnknown: true })
      .validateAsync(value);
    return value;
  }
}

@Injectable()
export class UpdatePasswordPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (metadata.data !== 'password') return value;

    await Joi.string()
      .min(8)
      .max(20)
      .pattern(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/)
      .message(USERS_VALIDATION_MESSAGES.PASSWORD_PATTERN)
      .validateAsync(value);

    return value;
  }
}

@Injectable()
export class CreateLeadPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (metadata.data !== 'lead') return value;

    await Joi.object({
      email: Joi.string().email(),
    })
      .options({ allowUnknown: true })
      .validateAsync(value);

    return value;
  }
}

@Injectable()
export class CheckBlackList implements PipeTransform {
  constructor(private configService: ConfigService) {}
  private readonly BlackList = {
    moto: 'moto',
    motodave: 'motodave',
    dave: 'dave',
    motocoaster: 'motocoaster',
    davidlarsonlevine: 'davidlarsonlevine',
    davidlevine: 'davidlevine',
    pops: 'pops'
  };

  async transform(
    value: UserProfile,
    metaData: ArgumentMetadata,
  ): Promise<unknown> {
    if (Object.values(this.BlackList).includes(value.username)) {
      throw new Error('Username already taken');
    }
    return value;
  }
}
