import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MongoIdSchema } from '@obtp/validation';
import { Types } from 'mongoose';

/**
 * Pipe chuẩn hóa validate MongoID.
 * Sử dụng Zod để validate format string.
 * Return: Types.ObjectId (Để các Service sử dụng ngay, vì Service API nằm cùng tầng Runtime).
 */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    // 1. Validate String format using Shared Validation
    const result = MongoIdSchema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(
        `"${value}" không phải là một ID hợp lệ cho tham số ${metadata.data || 'param'}.`,
      );
    }

    // 2. Return Mongoose ObjectId Object (Runtime)
    return new Types.ObjectId(value);
  }
}
