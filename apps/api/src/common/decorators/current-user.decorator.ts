import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// TODO: Đảm bảo User payload Interface khớp với @obtp/shared-types
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
