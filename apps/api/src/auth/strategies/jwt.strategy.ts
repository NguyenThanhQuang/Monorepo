import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtPayload, AuthUserResponse } from '@obtp/shared-types';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUserResponse> {
    // Gọi sang UsersModule để lấy data mới nhất (check active/ban status)
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Tài khoản đã bị khóa.');
    }

    // Mapping sang format chuẩn Interface
    return {
      id: user._id.toString(), // Standard ID
      userId: user._id.toString(), // JWT Strategy Legacy support
      email: user.email,
      name: user.name,
      phone: user.phone,
      roles: user.roles,
      companyId: user.companyId?.toString(),
      isEmailVerified: user.isEmailVerified,
    };
  }
}