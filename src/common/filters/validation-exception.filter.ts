import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { cleanErrorMessages } from '../helpers/clean-error-message';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const error = exceptionResponse['error'];
    const messages = exceptionResponse['message'];
    const validationErrors = cleanErrorMessages(messages);

    response.status(status).json({
      statusCode: status,
      message: validationErrors,
      error,
    });
  }
}
