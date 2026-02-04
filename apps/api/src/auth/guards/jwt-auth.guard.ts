import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: any, info: unknown) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token đã hết hạn.');
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }
    if (err || !user) {
      throw err || new UnauthorizedException('Chưa xác thực.');
    }
    return user;
  }
}
