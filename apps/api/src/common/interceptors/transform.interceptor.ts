import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '@obtp/shared-types';
import { Types } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T | unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T | unknown>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        let message = 'Success';
        let finalData: unknown = data;

        // Xử lý chuẩn hóa data nếu Controller trả về dạng { message, data }
        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'message' in data
        ) {
          const dataObj = data as Record<string, unknown>;
          if (typeof dataObj.message === 'string') {
            message = dataObj.message;
          }

          if ('data' in dataObj) {
            finalData = dataObj.data;
          } else if (Object.keys(dataObj).length === 1) {
            // Trường hợp chỉ có { message: '...' }
            finalData = null;
          }
        }

        const transformedData = this.transformIds(finalData);

        return {
          statusCode,
          message,
          data: transformedData,
        };
      }),
    );
  }

  // Helper chuyển đổi _id (ObjectId) -> id (string) recursively
  private transformIds(data: unknown): unknown {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transformIds(item));
    }

    if (data instanceof Types.ObjectId) {
      return data.toString();
    }

    if (data instanceof Date) {
      return data;
    }

    if (typeof data === 'object') {
      // Handle Mongoose Documents
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (data as any).toObject === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = (data as any).toObject();
      }

      const newData: Record<string, unknown> = {};
      const dataObj = data as Record<string, unknown>;

      for (const key in dataObj) {
        if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
          if (key === '_id') {
            // Mapping cốt tử: _id -> id
            newData['id'] = this.transformIds(dataObj[key]);
          } else if (key === '__v') {
            continue;
          } else {
            newData[key] = this.transformIds(dataObj[key]);
          }
        }
      }
      return newData;
    }

    return data;
  }
}
