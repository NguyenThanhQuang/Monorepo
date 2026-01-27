import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from '@obtp/shared-types';

import { UserDocument } from '@/users/schemas/user.schema';
import {
  AUTH_CONSTANTS,
  comparePassword,
  generateRandomToken,
  hashPassword,
} from '@obtp/business-logic';
import { UsersService } from '../users/users.service';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}

  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const emailLower = payload.email.toLowerCase();

    const existingUser = await this.usersService.findOneByEmail(emailLower);

    if (existingUser) {
      if (
        !existingUser.isEmailVerified &&
        existingUser.emailVerificationToken
      ) {
        const newToken = generateRandomToken();
        await this.usersService.updateVerificationInfo(
          existingUser._id.toString(),
          {
            token: newToken,
            expires: new Date(
              Date.now() +
                AUTH_CONSTANTS.DEFAULTS.EMAIL_VERIFICATION_EXPIRATION_MS,
            ),
          },
        );

        this.eventEmitter.emit('user.resend_verification', {
          email: existingUser.email,
          name: existingUser.name,
          token: newToken,
        });
        return {
          message:
            'Email đã tồn tại nhưng chưa xác thực. Đã gửi lại email kích hoạt.',
        };
      }
      throw new ConflictException('Email đã được sử dụng.');
    }

    const existingPhone = await this.usersService.findOneByPhone(payload.phone);
    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã được sử dụng.');
    }

    const verificationToken = generateRandomToken();
    const hashedPassword = await hashPassword(payload.password);

    const newUser = await this.usersService.create({
      ...payload,
      email: emailLower,
      passwordHash: hashedPassword,
      roles: [UserRole.USER],
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(
        Date.now() + AUTH_CONSTANTS.DEFAULTS.EMAIL_VERIFICATION_EXPIRATION_MS,
      ),
    });

    this.eventEmitter.emit('user.registered', {
      email: newUser.email,
      name: newUser.name,
      token: verificationToken,
    });

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
    };
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { identifier, password } = payload;

    let user: UserDocument | null = null;

    if (identifier.includes('@')) {
      user = await this.usersService.findOneByEmail(identifier.toLowerCase());
    } else {
      user = await this.usersService.findOneByPhone(identifier);
    }

    if (!user) {
      throw new UnauthorizedException(
        'Thông tin đăng nhập người dùng không chính xác.',
      );
    }

    const passToCompare = user.passwordHash;
    if (!passToCompare) {
      throw new UnauthorizedException(
        'Tài khoản không hỗ trợ đăng nhập mật khẩu.',
      );
    }

    const isPasswordValid = await comparePassword(password, passToCompare);

    if (!isPasswordValid)
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');

    if (user.isBanned) throw new UnauthorizedException('Tài khoản bị khóa.');

    if (!user.isEmailVerified)
      throw new UnauthorizedException('Tài khoản chưa xác thực email.');

    await this.usersService.updateLastLogin(user._id.toString());

    const sanitizedUser = this.usersService.sanitizeUser(user);
    const accessToken = this.tokenService.generateAccessToken(user);

    return {
      accessToken,
      user: sanitizedUser,
    };
  }

  async verifyEmail(token: string): Promise<LoginResponse> {
    const user = await this.usersService.verifyEmailToken(token);
    if (!user)
      throw new BadRequestException('Token không hợp lệ hoặc hết hạn.');

    const accessToken = this.tokenService.generateAccessToken(user);
    return {
      accessToken,
      user: this.usersService.sanitizeUser(user),
    };
  }

  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
    const user = await this.usersService.findOneByEmail(
      payload.email.toLowerCase(),
    );
    if (!user) return;

    const token = generateRandomToken();
    const expires = new Date(
      Date.now() + AUTH_CONSTANTS.DEFAULTS.PASSWORD_RESET_EXPIRATION_MS,
    );

    await this.usersService.updateLastLogin(user._id.toString());

    this.eventEmitter.emit('user.forgot_password', {
      email: user.email,
      name: user.name,
      token: token,
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const hashedPassword = await hashPassword(payload.newPassword);
    const result = await this.usersService.resetPasswordWithToken(
      payload.token,
      hashedPassword,
    );
    if (!result)
      throw new BadRequestException('Token không hợp lệ hoặc hết hạn.');
  }
}
