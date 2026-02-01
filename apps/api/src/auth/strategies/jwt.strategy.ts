import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthUserResponse, JwtPayload } from '@obtp/shared-types';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUserResponse> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Tài khoản đã bị khóa.');
    }

    return {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      roles: user.roles,
      companyId: user.companyId?.toString(),
      isEmailVerified: user.isEmailVerified,
    };
  }
}
