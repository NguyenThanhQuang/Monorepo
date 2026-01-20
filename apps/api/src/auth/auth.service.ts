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
  AuthUserResponse,
  ForgotPasswordPayload,
  JwtPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from '@obtp/shared-types';

import {
  AUTH_CONSTANTS,
  comparePassword,
  generateRandomToken,
  hashPassword,
} from '@obtp/business-logic';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    // @Inject(forwardRef(() => CompaniesService))
    // private companiesService: CompaniesService,

    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  /**
   * HELPERS
   */
  private generateAccessToken(user: any): string {
    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      roles: user.roles,
      companyId: user.companyId?.toString(),
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any): AuthUserResponse {
    // Delegate to UsersService if needed, or map locally
    if (this.usersService.sanitizeUser) {
      return this.usersService.sanitizeUser(user);
    }
    return {
      id: user._id.toString(),
      _id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      roles: user.roles,
      companyId: user.companyId?.toString(),
      isEmailVerified: user.isEmailVerified,
      lastLoginDate: user.lastLoginDate,
    };
  }

  /**
   * CORE FLOWS
   */

  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const emailLower = payload.email.toLowerCase();

    // 1. Check tồn tại qua UsersService (Abstract DB)
    const existingUser = await this.usersService.findOneByEmail(emailLower);

    // Logic Resend Token nếu user đã tồn tại nhưng chưa active (Giữ lại logic cũ)
    if (existingUser) {
      if (
        !existingUser.isEmailVerified &&
        existingUser.emailVerificationToken
      ) {
        // Check expiration, regen token logic...
        // ... (Tối giản code demo: Update token & Resend)
        const newToken = generateRandomToken();
        await this.usersService.updateVerificationInfo(existingUser._id, {
          token: newToken,
          expires: new Date(
            Date.now() +
              AUTH_CONSTANTS.DEFAULTS.EMAIL_VERIFICATION_EXPIRATION_MS,
          ),
        });

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

    // Check Phone
    const existingPhone = await this.usersService.findOneByPhone(payload.phone);
    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã được sử dụng.');
    }

    // 2. Prepare Data
    const verificationToken = generateRandomToken();
    const hashedPassword = await hashPassword(payload.password);

    // 3. Create User (Delegated to UsersService)
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

    // 4. Emit Event
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

    // 1. Find User
    let user;
    if (identifier.includes('@')) {
      user = await this.usersService.findOneByEmail(identifier.toLowerCase());
    } else {
      user = await this.usersService.findOneByPhone(identifier);
    }

    if (!user)
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');

    // 2. Security Checks
    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash || user.password,
    ); // Fallback field
    if (!isPasswordValid)
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');

    if (user.isBanned) throw new UnauthorizedException('Tài khoản bị khóa.');
    if (!user.isEmailVerified)
      throw new UnauthorizedException('Tài khoản chưa xác thực email.');

    // 3. Company Admin Check (Optional Refactor later)
    if (user.roles.includes(UserRole.COMPANY_ADMIN) && user.companyId) {
      // TODO: Call CompaniesService.findById(user.companyId) -> Check Status
      // if (company.status !== CompanyStatus.ACTIVE) throw ...
    }

    // 4. Finalize
    // Update Last Login
    await this.usersService.updateLastLogin(user._id);

    const accessToken = this.generateAccessToken(user);
    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  // --- TOKEN VERIFICATION FLOWS (Verify, Resend, Forgot...) ---
  // Các hàm này cần logic tìm user theo token, kiểm tra hạn (dùng date trong users schema)
  // và update lại state của user thông qua usersService.

  async verifyEmail(token: string): Promise<LoginResponse> {
    // Code tương tự processEmailVerification cũ nhưng clean hơn
    // await this.usersService.findOneByCondition({ emailVerificationToken: token })...
    const user = await this.usersService.verifyEmailToken(token); // Giả sử UsersService handle logic DB check
    if (!user)
      throw new BadRequestException('Token không hợp lệ hoặc hết hạn.');

    const accessToken = this.generateAccessToken(user);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  // ... (Tương tự cho requestPasswordReset, resetPassword - gọi Logic lib tạo token, hash pass, rồi gọi UsersService save)
  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
    const user = await this.usersService.findOneByEmail(
      payload.email.toLowerCase(),
    );
    if (!user) return; // Silent fail security

    const token = generateRandomToken();
    const expires = new Date(
      Date.now() + AUTH_CONSTANTS.DEFAULTS.PASSWORD_RESET_EXPIRATION_MS,
    );

    await this.usersService.setResetToken(user._id, token, expires);

    this.eventEmitter.emit('user.forgot_password', {
      email: user.email,
      name: user.name,
      token: token,
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const hashedPassword = await hashPassword(payload.newPassword);
    // User service cần method: findByResetTokenAndUpdatePassword(token, newPassHash)
    const result = await this.usersService.resetPasswordWithToken(
      payload.token,
      hashedPassword,
    );
    if (!result)
      throw new BadRequestException('Token không hợp lệ hoặc hết hạn.');
  }
}
