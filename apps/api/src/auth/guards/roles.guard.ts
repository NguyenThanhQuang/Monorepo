import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUserResponse, UserRole } from '@obtp/shared-types';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('User context invalid.');
    }

    const authUser = user as AuthUserResponse;

    const hasRole = requiredRoles.some((role) => authUser.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Không đủ quyền hạn truy cập.');
    }
    return true;
  }
}
