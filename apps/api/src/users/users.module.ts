import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserDefinition, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
// import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserDefinition.name, schema: UserSchema }]),
    // Dùng forwardRef nếu AuthModule cần UsersService (chắc chắn có)
    forwardRef(() => AuthModule),
    // forwardRef(() => BookingsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
