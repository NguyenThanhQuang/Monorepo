import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ValidationErrorDetail } from '@obtp/shared-types';
import { ZodError } from 'zod';

export interface ZodSchemaLike {
  parse(data: unknown): any;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchemaLike) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: this.mapErrors(error),
        });
      }

      if (error && typeof error === 'object' && 'issues' in error) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: this.mapErrors(error as ZodError),
        });
      }

      throw new BadRequestException('Validation failed');
    }
  }

  private mapErrors(error: ZodError): ValidationErrorDetail[] {
    return error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }
}
