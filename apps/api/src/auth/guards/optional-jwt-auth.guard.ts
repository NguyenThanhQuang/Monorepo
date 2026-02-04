import { UserDocument } from '@/users/schemas/user.schema';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserDocument | false>(
    err: unknown,
    user: TUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
  ): TUser {
    if (err) {
      // Nếu có lỗi thực sự, ném ra ngoài (ví dụ token malformed gây 500 nếu cần thiết)
      // Nhưng Optional Guard thường lờ đi.
      // Với Optional: có lỗi coi như guest
      return false as TUser;
    }
    return user;
  }
}
