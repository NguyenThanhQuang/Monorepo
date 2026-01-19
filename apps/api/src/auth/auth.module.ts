import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
// import { CompaniesModule } from '../companies/companies.module';

import { AUTH_CONSTANTS } from '@obtp/business-logic';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Chống circular dependency với UsersModule nếu Users cũng cần Auth
    forwardRef(() => UsersModule),
    // forwardRef(() => CompaniesModule),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // FIX: Ép kiểu as string | number để thỏa mãn Interface của JwtModuleOptions
          expiresIn: configService.get<string>(
            'JWT_EXPIRATION_TIME',
            AUTH_CONSTANTS.DEFAULTS.JWT_EXPIRATION_TIME,
          ) as string | number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
