import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { transformMongoId } from '@obtp/business-logic';
import { ApiResponse } from '@obtp/shared-types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface MessageResponse {
  message: string;
  data?: unknown;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();

        if (data instanceof StreamableFile || response.headersSent) {
          return data;
        }

        const statusCode = response.statusCode;

        let message = 'Success';
        let finalData = data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('message' in data && 'data' in data) {
            const explicitRes = data as MessageResponse;
            message = explicitRes.message;
            finalData = explicitRes.data as T;
          } else if ('message' in data && Object.keys(data).length === 1) {
            const explicitRes = data as MessageResponse;
            message = explicitRes.message;
            finalData = null;
          }
        }

        return {
          statusCode,
          message,
          data: transformMongoId(finalData),
        };
      }),
    );
  }
}
