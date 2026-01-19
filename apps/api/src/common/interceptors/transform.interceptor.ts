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

        // Skip transformation if stream or response headers sent
        if (data instanceof StreamableFile || response.headersSent) {
          return data;
        }

        const statusCode = response.statusCode;

        // Default values
        let message = 'Success';
        let finalData = data;

        // Xử lý custom response message
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('message' in data && 'data' in data) {
            message = data.message;
            finalData = data.data;
          } else if ('message' in data && Object.keys(data).length === 1) {
            message = data.message;
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
