import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiErrorResponse } from '@obtp/shared-types';
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

    // Lấy message gốc hoặc Zod validation array
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let errorMessage =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exceptionResponse;

    // Mapping for specific error detail from Zod pipe
    const errorDetail =
      typeof exceptionResponse === 'object' &&
      'errors' in (exceptionResponse as any)
        ? (exceptionResponse as any).errors
        : errorMessage;

    // Logging Strategy
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
      message: errorDetail,
    };

    response.status(status).json(apiError);
  }
}
