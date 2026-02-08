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
  AUTH_CONSTANTS,
  comparePassword,
  generateRandomToken,
  hashPassword,
} from '@obtp/business-logic';
import {
  ActivateAccountPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  TokenValidationResult,
  UserRole,
} from '@obtp/shared-types';
import { CompanyDocument } from 'src/companies/schemas/company.schema';
import { UserDocument } from 'src/users/schemas/user.schema';
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

  async validateUser(
    identifier: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const identifierLower = identifier.toLowerCase();
    let user: UserDocument | null = null;

    if (identifier.includes('@')) {
      user = await this.usersService.findOneByEmail(identifierLower);
    } else {
      user = await this.usersService.findOneByPhone(identifier);
    }

    if (!user) return null;

    if (!user.passwordHash) return null;

    const isMatch = await comparePassword(pass, user.passwordHash);
    return isMatch ? user : null;
  }

  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const emailLower = payload.email.toLowerCase();
    const existingUser = await this.usersService.findOneByEmail(emailLower);

    if (existingUser) {
      if (
        !existingUser.isEmailVerified &&
        existingUser.emailVerificationToken
      ) {
        // Logic resend nếu chưa verify
        await this.requestResendVerificationEmail(existingUser.email);
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

  async requestResendVerificationEmail(email: string): Promise<void> {
    const emailLower = email.toLowerCase();
    const user = await this.usersService.findOneByEmail(emailLower);

    if (!user) {
      this.logger.warn(`Resend request for non-existent: ${emailLower}`);
      return;
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email này đã được xác thực trước đó.');
    }

    const newToken = generateRandomToken();
    const expiresMs = this.configService.get<number>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MS',
      86400000,
    );
    const expires = new Date(Date.now() + expiresMs);

    await this.usersService.updateVerificationInfo(user._id.toString(), {
      token: newToken,
      expires,
    });

    this.eventEmitter.emit('user.resend_verification', {
      email: user.email,
      name: user.name,
      token: newToken,
    });
    this.logger.log(`Resent verification email to ${user.email}`);
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

  async validatePasswordResetToken(
    token: string,
  ): Promise<TokenValidationResult> {
    const user = await this.usersService.findOneByResetToken(token);

    if (!user) {
      return { isValid: false, message: 'Token không hợp lệ hoặc đã sử dụng.' };
    }
    if (
      user.passwordResetExpires &&
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return { isValid: false, message: 'Token đã hết hạn.' };
    }

    return { isValid: true, email: user.email };
  }

  async validateActivationToken(token: string): Promise<TokenValidationResult> {
    const user = await this.usersService.findOneByActivationToken(token);
    if (!user) {
      return { isValid: false, message: 'Token không hợp lệ hoặc đã hết hạn.' };
    }

    let companyName = 'Chưa cập nhật';
    if (user.companyId && typeof user.companyId === 'object') {
      const companyDoc = user.companyId as unknown as CompanyDocument;
      if ('name' in companyDoc) {
        companyName = companyDoc.name;
      }
    }

    return {
      isValid: true,
      userName: user.name,
      companyName: companyName,
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

    await this.usersService.setResetToken(user._id.toString(), token, expires);
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

  async activateAccount(
    payload: ActivateAccountPayload,
  ): Promise<LoginResponse> {
    const user = await this.usersService.findOneByActivationToken(
      payload.token,
    );
    if (!user) {
      throw new BadRequestException(
        'Token kích hoạt không hợp lệ hoặc đã hết hạn.',
      );
    }

    const hashedPassword = await hashPassword(payload.newPassword);
    user.passwordHash = hashedPassword;
    user.isEmailVerified = true;
    user.accountActivationToken = undefined;
    user.accountActivationExpires = undefined;

    const savedUser = await this.usersService.save(user);

    return {
      accessToken: this.tokenService.generateAccessToken(savedUser),
      user: this.usersService.sanitizeUser(savedUser),
    };
  }
}
