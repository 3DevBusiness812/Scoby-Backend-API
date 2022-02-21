import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import Joi from '@hapi/joi';

@Injectable()
export class PagingPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (metadata.data !== 'paging') return value;
    const normalizedValue = value ?? {};

    return Joi.object({
      page: Joi.number().integer().positive().default(1),
      limit: Joi.number().integer().positive().max(100).default(20),
    }).validateAsync(normalizedValue);
  }
}
