import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { normalizeResponseData } from '@obtp/business-logic';
import { ApiResponse } from '@obtp/shared-types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        let message = 'Success';
        let rawData = data;

        // Xử lý trường hợp Controller trả về { message, data } thủ công
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Safe check for 'message' key
          const hasMessage = 'message' in data;
          const hasData = 'data' in data;

          if (hasMessage && hasData) {
            message = data.message;
            rawData = data.data;
          } else if (hasMessage && Object.keys(data).length === 1) {
            message = data.message;
            rawData = null;
          }
        }

        // Prepare Mongoose Documents (Integration Layer Responsibility)
        // Hàm pure normalizeResponseData không nhận Document, nên phải convert trước.
        // Đây là recursive nhưng chỉ cạn (shallow) nếu mảng object chưa gọi .toObject.
        // Tuy nhiên, phương pháp an toàn nhất: data.toObject() nếu nó là Mongoose Doc.

        const preparedData = this.prepareMongooseData(rawData);
        const transformedData = normalizeResponseData(preparedData) as T;

        return {
          statusCode,
          message,
          data: transformedData,
        };
      }),
    );
  }

  /**
   * Helper function to convert Mongoose Documents to POJO (Plain Old Json Object)
   * This is allowed here (Infrastructure Layer) but BANNED in Business Logic package.
   */
  private prepareMongooseData(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.prepareMongooseData(item));
    }

    if (typeof data === 'object' && typeof data.toObject === 'function') {
      return data.toObject();
    }

    return data;
  }
}
