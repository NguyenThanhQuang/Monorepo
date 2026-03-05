import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiErrorResponse,
  ErrorResponseObject,
  ValidationErrorDetail,
} from '@obtp/shared-types';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let errorMessage: string | object | ValidationErrorDetail[] =
      'Unknown error';
    let errorDetail: string | object | ValidationErrorDetail[] | undefined;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
      errorDetail = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const resObj = exceptionResponse as unknown as ErrorResponseObject;

      if ('message' in resObj) {
        errorMessage = resObj.message;
      }

      if ('errors' in resObj && resObj.errors) {
        errorDetail = resObj.errors;
      } else {
        errorDetail = errorMessage;
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[500] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${status}] ${request.method} ${request.url} | Error: ${JSON.stringify(errorDetail)}`,
      );
    }

    const apiError: ApiErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorDetail || errorMessage,
    };

    response.status(status).json(apiError);
  }
}
