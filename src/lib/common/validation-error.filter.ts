import { Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationError } from '@hapi/joi';
import { ApolloError } from 'apollo-server-express';
import { COMMON_ERRORS } from './common.messages';

@Catch(ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: ValidationError): void {
    throw new ApolloError(
      COMMON_ERRORS.VALIDATION_FAILED.MESSAGE,
      COMMON_ERRORS.VALIDATION_FAILED.CODE,
      { details: exception.details },
    );
  }
}
