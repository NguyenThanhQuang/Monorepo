import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MongoIdSchema } from '@obtp/validation';
import { Types } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, Types.ObjectId> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    // Sử dụng Zod Schema để validate logic string trước khi chuyển đổi
    const result = MongoIdSchema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(
        `"${value}" không phải là một MongoID hợp lệ.`,
      );
    }

    return new Types.ObjectId(value);
  }
}
