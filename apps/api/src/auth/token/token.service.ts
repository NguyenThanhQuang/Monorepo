import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@obtp/shared-types';
import { randomBytes } from 'crypto';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {};
  generateAccessToken(user: UserDocument): string {
    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      roles: user.roles,
      companyId: user.companyId?.toString(),
    };
    return this.jwtService.sign(payload);
  }

  generateRandomToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
