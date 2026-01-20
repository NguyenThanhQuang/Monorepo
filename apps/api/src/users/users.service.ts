import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  AUTH_CONSTANTS,
  comparePassword,
  generateRandomToken,
  hashPassword,
  sanitizeUser,
} from '@obtp/business-logic';
import {
  AuthUserResponse,
  ChangePasswordPayload,
  CreateCompanyAdminPayload,
  CreateUserPayload,
  SanitizedUserResponse,
  UpdateUserPayload,
  UserRole,
} from '@obtp/shared-types';
import { Connection, Types } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

interface CreateInternalUserParams extends CreateUserPayload {
  passwordHash?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  roles?: UserRole[];
  accountActivationToken?: string;
  accountActivationExpires?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectConnection() private readonly connection: Connection,
    // @Inject(forwardRef(() => BookingsRepository))
    // private readonly bookingsRepository: BookingsRepository,
  ) {}

  // --- PUBLIC HELPERS (Used by Auth Module) ---

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.usersRepository.findById(id);
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findOneByEmailWithPassword(email);
  }

  async findOneByPhone(phone: string): Promise<UserDocument | null> {
    return this.usersRepository.findOneByPhoneWithPassword(phone);
  }

  sanitizeUser(user: UserDocument): AuthUserResponse {
    const raw = sanitizeUser(user);
    return {
      ...raw,
      userId: raw.id,
      companyId: raw.companyId,
    } as unknown as AuthUserResponse;
  }

  // --- CORE FEATURES ---

  async create(payload: CreateInternalUserParams): Promise<UserDocument> {
    let finalHash = payload.passwordHash;
    if (!finalHash && payload.password) {
      finalHash = await hashPassword(payload.password);
    }

    const docInput: Record<string, any> = {
      email: payload.email,
      phone: payload.phone,
      name: payload.name,
      passwordHash: finalHash,
      roles: payload.roles || (payload.role ? [payload.role] : [UserRole.USER]),
      isEmailVerified: payload.isEmailVerified ?? false,

      emailVerificationToken: payload.emailVerificationToken,
      emailVerificationExpires: payload.emailVerificationExpires,

      accountActivationToken: payload.accountActivationToken,
      accountActivationExpires: payload.accountActivationExpires,
    };

    if (payload.companyId) {
      docInput.companyId = new Types.ObjectId(payload.companyId);
    }

    return this.usersRepository.create(docInput);
  }

  async updateProfile(
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<SanitizedUserResponse> {
    const updatedUser = await this.usersRepository.update(userId, payload);
    if (!updatedUser) throw new NotFoundException('Người dùng không tồn tại');
    return sanitizeUser(updatedUser);
  }

  async changePassword(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    // 1. Fetch User (kèm pass cũ để so sánh)
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('User not found');

    // 2. Validate pass cũ (Logic Lib)
    const isValid = await comparePassword(
      payload.currentPassword,
      user.passwordHash,
    );
    if (!isValid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    // 3. Hash pass mới & Save
    user.passwordHash = await hashPassword(payload.newPassword);
    await this.usersRepository.save(user);

    return { message: 'Đổi mật khẩu thành công.' };
  }

  async updateLastLogin(id: string): Promise<void> {
    // Repository nhận string ID và tự xử lý logic DB
    await this.usersRepository.update(id, { lastLoginDate: new Date() });
  }

  // Input 'data' được typed chặt chẽ
  async updateVerificationInfo(
    userId: string,
    data: { token: string; expires: Date },
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerificationToken: data.token,
      emailVerificationExpires: data.expires,
    });
  }

  // --- ADMIN FEATURES ---

  async findAllForAdmin(): Promise<SanitizedUserResponse[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => sanitizeUser(user));
  }

  async updateUserStatus(
    userId: string,
    isBanned: boolean,
  ): Promise<SanitizedUserResponse> {
    const updated = await this.usersRepository.update(userId, { isBanned });
    if (!updated) throw new NotFoundException('User not found');
    return sanitizeUser(updated);
  }

  // Helper for Auth Module Password Reset
  async setResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });
  }

  async resetPasswordWithToken(
    token: string,
    passwordHash: string,
  ): Promise<boolean> {
    // Find user with valid token
    const user = await this.usersRepository.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }, // MongoDB query logic
    });

    if (!user) return false;

    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.usersRepository.save(user);
    return true;
  }

  async verifyEmailToken(token: string): Promise<UserDocument | null> {
    const user = await this.usersRepository.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) return null;

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    return this.usersRepository.save(user);
  }

  async createOrPromoteCompanyAdmin(
    payload: CreateCompanyAdminPayload,
  ): Promise<{ user: UserDocument; isNew: boolean }> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let user = await this.usersRepository.findOne({ email: payload.email });
      let isNew = false;

      if (user) {
        if (!user.roles.includes(UserRole.COMPANY_ADMIN)) {
          user.roles.push(UserRole.COMPANY_ADMIN);
        }
        // Ép kiểu vì Repository wrapper đang dùng String id hoặc ObjectId.
        // User schema yêu cầu ObjectId cho field ref
        user.companyId = new Types.ObjectId(payload.companyId);
        await this.usersRepository.save(user, session);
      } else {
        isNew = true;
        // Dùng pure function logic, không cần inject TokenService
        const activationToken = generateRandomToken();

        user = await this.usersRepository.create(
          {
            email: payload.email,
            name: payload.name,
            phone: payload.phone,
            companyId: new Types.ObjectId(payload.companyId),
            roles: [UserRole.COMPANY_ADMIN],
            isEmailVerified: false,
            passwordHash: 'temp_placeholder_hash',
            accountActivationToken: activationToken,
            accountActivationExpires: new Date(
              Date.now() +
                AUTH_CONSTANTS.DEFAULTS.EMAIL_VERIFICATION_EXPIRATION_MS,
            ), // 24h
          },
          session,
        );
      }

      await session.commitTransaction();
      return { user: user!, isNew };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // TODO: Refactor Bookings Logic later when Booking Module is migrated
  // async findUserBookings(userId: string) { ... }
}
