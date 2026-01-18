import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from '@obtp/shared-types';
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
        : 'Internal server error';

    let errorMessage: string | object = exceptionResponse;

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorMessage = (exceptionResponse as any).message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `End-point: ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `End-point: ${request.url} | Error: ${JSON.stringify(errorMessage)}`,
      );
    }

    // Trả về cấu trúc ApiResponse chuẩn
    const errorBody: ApiResponse<null> = {
      statusCode: status,
      message:
        typeof errorMessage === 'string'
          ? errorMessage
          : JSON.stringify(errorMessage),
      data: null,
    };

    response.status(status).json(errorBody);
  }
}
