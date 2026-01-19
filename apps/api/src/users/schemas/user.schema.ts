import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from '@obtp/shared-types';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  // Mapping _id (implicit in Mongoose) to interface requirement is handled in Logic layer

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ type: String, required: true, unique: true, trim: true })
  phone: string;

  @Prop({ type: String, select: false }) // Ẩn mặc định
  passwordHash: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({
    type: [{ type: String, enum: Object.values(UserRole) }],
    required: true,
    default: [UserRole.USER],
  })
  roles: UserRole[];

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({
    type: String,
    select: false,
    index: true,
    unique: true,
    sparse: true,
  })
  emailVerificationToken?: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpires?: Date;

  @Prop({
    type: String,
    select: false,
    index: true,
    unique: true,
    sparse: true,
  })
  accountActivationToken?: string;

  @Prop({ type: Date, select: false })
  accountActivationExpires?: Date;

  @Prop({
    type: String,
    select: false,
    index: true,
    unique: true,
    sparse: true,
  })
  passwordResetToken?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires?: Date;

  @Prop({ type: Date, select: false })
  lastLoginDate?: Date;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index TTL để xóa account ảo chưa active sau một thời gian
UserSchema.index(
  { accountActivationExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { passwordHash: { $exists: false } },
  },
);
