import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@obtp/business-logic';
import * as sharedTypes from '@obtp/shared-types';
import { Model, Types } from 'mongoose';
import { BookingsRepository } from '../bookings/bookings.repository';
import { BookingsService } from '../bookings/bookings.service';
import { UsersRepository } from '../users/users.repository';
import {
  DriverProfileDefinition,
  DriverProfileDocument,
  DriverProfileStatus,
} from './schemas/driver-profile.schema';

@Injectable()
export class DriversService {
  constructor(
    private readonly bookingsRepo: BookingsRepository,
    private readonly bookingsService: BookingsService,
    private readonly usersRepository: UsersRepository,
    @InjectModel(DriverProfileDefinition.name)
    private readonly driverProfileModel: Model<DriverProfileDocument>,
  ) {}

  private toIdString(v: any): string | undefined {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    if (v instanceof Types.ObjectId) return v.toString();
    if (v?._id) return this.toIdString(v._id);
    if (typeof v?.toString === 'function') return v.toString();
    return undefined;
  }

  /**
   * User đăng ký làm tài xế.
   * Demo: auto APPROVED + add role driver.
   */
  async registerDriver(
    user: sharedTypes.AuthUserResponse,
    payload: {
      licenseNumber: string;
      idCardNumber: string;
      experienceYears?: number;
    },
  ) {
    const userId = user.id;
    if (!userId) throw new BadRequestException('Missing user id');
    if (!payload?.licenseNumber || !payload?.idCardNumber) {
      throw new BadRequestException(
        'licenseNumber and idCardNumber are required',
      );
    }

    const existed = await this.driverProfileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (existed) {
      existed.licenseNumber = payload.licenseNumber;
      existed.idCardNumber = payload.idCardNumber;
      existed.experienceYears =
        payload.experienceYears ?? existed.experienceYears;
      existed.status = DriverProfileStatus.APPROVED;
      await existed.save();
    } else {
      await this.driverProfileModel.create({
        userId: new Types.ObjectId(userId),
        licenseNumber: payload.licenseNumber,
        idCardNumber: payload.idCardNumber,
        experienceYears: payload.experienceYears ?? 0,
        status: DriverProfileStatus.APPROVED,
      } as Partial<DriverProfileDefinition>);
    }

    const doc = await this.usersRepository.findById(userId);
    if (doc) {
      const roles = (doc as any).roles ?? [];
      const driverRole = (sharedTypes.UserRole as any).DRIVER ?? 'driver';
      if (!roles.includes(driverRole)) roles.push(driverRole);
      (doc as any).roles = roles;
      await this.usersRepository.save(doc);
    }

    return { ok: true, message: 'Đăng ký tài xế thành công.' };
  }

  async getMyDriverProfile(user: sharedTypes.AuthUserResponse) {
    const userId = user.id;
    const profile = await this.driverProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    return { ok: true, data: profile };
  }

  async validateTicket(
    ticketId: string,
    driver?: sharedTypes.AuthUserResponse,
  ) {
    if (!ticketId) throw new BadRequestException('ticketId is required');
    const booking = await this.bookingsRepo.findByCodeOrId(ticketId);
    if (!booking) throw new NotFoundException('Ticket not found');

    const driverCompanyId = this.toIdString((driver as any)?.companyId);
    const bookingCompanyId = this.toIdString((booking as any)?.companyId);
    if (
      driverCompanyId &&
      bookingCompanyId &&
      driverCompanyId !== bookingCompanyId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền quét vé của nhà xe khác.',
      );
    }

    const status = String((booking as any)?.status || '').toUpperCase();
    const payStatus = String(
      (booking as any)?.paymentStatus || '',
    ).toUpperCase();
    if (status !== 'CONFIRMED' || payStatus !== 'PAID') {
      return {
        ok: false,
        message: 'Vé chưa thanh toán hoặc chưa được xác nhận.',
      };
    }

    if ((booking as any).checkedInAt) {
      return {
        ok: false,
        message: 'Vé đã được sử dụng (đã check-in).',
      };
    }

    const seat = booking.passengers?.[0]?.seatNumber;
    const passengerName = booking.passengers?.[0]?.name || booking.contactName;

    return {
      ok: true,
      ticket: {
        id: booking._id.toString(),
        bookingId: booking._id.toString(),
        tripId: booking.tripId?.toString?.() ?? String(booking.tripId),
        passengerName,
        seat,
        status: (booking as any).status,
        extras: {
          ticketCode: booking.ticketCode,
          paymentStatus: booking.paymentStatus,
        },
      },
    };
  }

  async confirmTicket(ticketId: string, driver?: sharedTypes.AuthUserResponse) {
    if (!ticketId) throw new BadRequestException('ticketId is required');
    const booking = await this.bookingsRepo.findByCodeOrId(ticketId);
    if (!booking) throw new NotFoundException('Ticket not found');

    const driverCompanyId = this.toIdString((driver as any)?.companyId);
    const bookingCompanyId = this.toIdString((booking as any)?.companyId);
    if (
      driverCompanyId &&
      bookingCompanyId &&
      driverCompanyId !== bookingCompanyId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xác nhận vé của nhà xe khác.',
      );
    }

    const status = String((booking as any)?.status || '').toUpperCase();
    const payStatus = String(
      (booking as any)?.paymentStatus || '',
    ).toUpperCase();
    if (status !== 'CONFIRMED' || payStatus !== 'PAID') {
      throw new BadRequestException(
        'Vé chưa thanh toán hoặc chưa được xác nhận.',
      );
    }

    if ((booking as any).checkedInAt) {
      return { ok: false, message: 'Vé đã được sử dụng trước đó.' };
    }

    (booking as any).checkedInAt = new Date();
    if (driver?.id) {
      (booking as any).checkedInBy = driver.name || driver.id;
      (booking as any).checkedInByDriverId = new Types.ObjectId(driver.id);
    }
    await this.bookingsRepo.save(booking);

    return { ok: true, message: 'Confirmed' };
  }

  async getCompanyDrivers(
    companyId: string,
  ): Promise<sharedTypes.DriverResponse[]> {
    const users = await this.usersRepository.findMany({
      companyId: new Types.ObjectId(companyId),
      roles: { $in: [(sharedTypes.UserRole as any).DRIVER ?? 'driver'] },
    });

    const userIds = users.map((u) => u._id);
    const profiles = await this.driverProfileModel
      .find({ userId: { $in: userIds } })
      .exec();

    return users.map((user) => {
      const profile = profiles.find(
        (p) => p.userId.toString() === user._id.toString(),
      );
      return {
        id: user._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        phone: user.phone,
        licenseNumber: profile?.licenseNumber || 'N/A',
        idCardNumber: profile?.idCardNumber || 'N/A',
        experienceYears: profile?.experienceYears || 0,
        status: user.isBanned ? 'inactive' : 'active',
        tripCount: 0,
        createdAt: user.createdAt,
      } as sharedTypes.DriverResponse;
    });
  }

  async createCompanyDriver(
    companyId: string,
    payload: sharedTypes.CreateDriverPayload,
  ) {
    const existingUser = await this.usersRepository.findOneByPhoneWithPassword(
      payload.phone,
    );
    if (existingUser) {
      throw new ConflictException(
        'Số điện thoại này đã được sử dụng trong hệ thống.',
      );
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(randomPassword);

    const newUser = await this.usersRepository.create({
      name: payload.name,
      phone: payload.phone,
      email: `driver_${Date.now()}@obtp.local`,
      passwordHash: hashedPassword,
      roles: [(sharedTypes.UserRole as any).DRIVER ?? 'driver'],
      companyId: new Types.ObjectId(companyId),
      isEmailVerified: true,
    });

    await this.driverProfileModel.create({
      userId: newUser._id,
      licenseNumber: payload.licenseNumber,
      idCardNumber: payload.idCardNumber,
      experienceYears: payload.experienceYears || 0,
      status: DriverProfileStatus.APPROVED,
    });

    return this.getDriverDetail(newUser._id.toString());
  }

  async updateCompanyDriver(
    companyId: string,
    driverId: string,
    payload: sharedTypes.UpdateDriverPayload,
  ) {
    const user = await this.usersRepository.findById(driverId);
    if (!user || user.companyId?.toString() !== companyId) {
      throw new NotFoundException('Không tìm thấy tài xế.');
    }

    if (payload.name) user.name = payload.name;
    if (payload.phone) user.phone = payload.phone;
    if (payload.status) user.isBanned = payload.status === 'inactive';
    await this.usersRepository.save(user);

    const profile = await this.driverProfileModel.findOne({
      userId: new Types.ObjectId(driverId),
    });
    if (profile) {
      if (payload.licenseNumber) profile.licenseNumber = payload.licenseNumber;
      if (payload.idCardNumber) profile.idCardNumber = payload.idCardNumber;
      if (payload.experienceYears !== undefined)
        profile.experienceYears = payload.experienceYears;
      await profile.save();
    }

    return this.getDriverDetail(driverId);
  }

  async deleteCompanyDriver(companyId: string, driverId: string) {
    const user = await this.usersRepository.findById(driverId);
    if (!user || user.companyId?.toString() !== companyId) {
      throw new NotFoundException('Không tìm thấy tài xế.');
    }
    user.isBanned = true;
    await this.usersRepository.save(user);
    return { message: 'Đã vô hiệu hóa tài xế thành công.' };
  }

  private async getDriverDetail(driverId: string) {
    const user = await this.usersRepository.findById(driverId);
    const profile = await this.driverProfileModel.findOne({
      userId: new Types.ObjectId(driverId),
    });
    return {
      id: user!._id.toString(),
      name: user!.name,
      phone: user!.phone,
      licenseNumber: profile?.licenseNumber || '',
      idCardNumber: profile?.idCardNumber || '',
      experienceYears: profile?.experienceYears || 0,
      status: user!.isBanned ? 'inactive' : 'active',
      tripCount: 0,
      createdAt: user!.createdAt,
    };
  }
}
