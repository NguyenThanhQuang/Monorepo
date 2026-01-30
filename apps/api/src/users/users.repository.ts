import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Model,
  QueryFilter,
  Types,
  UpdateQuery,
} from 'mongoose';
import { UserDefinition, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(UserDefinition.name) private userModel: Model<UserDocument>) {}

  async create(
    userData: Partial<UserDefinition>,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save({ session });
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id.toString())) return null;
    return this.userModel.findById(id).exec();
  }

  // Helper chuyên biệt để login/đổi pass (cần lấy passHash)
  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Dành cho auth strategy check pass
  async findOneByEmailWithPassword(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findOneByPhoneWithPassword(
    phone: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).select('+passwordHash').exec();
  }

  async findOne(
    filter: QueryFilter<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne(filter).exec();
  }

  // Hỗ trợ update linh hoạt
  async update(
    id: string,
    updateData: UpdateQuery<UserDocument>,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .exec();
  }

  // Save document (cho trường hợp find -> modify -> save logic phức tạp)
  async save(
    user: UserDocument,
    session?: ClientSession,
  ): Promise<UserDocument> {
    return user.save({ session });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
