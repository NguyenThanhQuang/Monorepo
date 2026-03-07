import { fakerVI as faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { hashPassword } from '@obtp/business-logic';
import {
  BookingStatus,
  CompanyStatus,
  LocationType,
  PaymentStatus,
  SeatStatus,
  TripStatus,
  UserRole,
  VehicleStatus,
} from '@obtp/shared-types';
import dayjs from 'dayjs';
import { Model, Types } from 'mongoose';
import { AppModule } from './app.module';
import { BookingDefinition } from './bookings/schemas/booking.schema';
import { CompanyDefinition } from './companies/schemas/company.schema';
import { LocationDefinition } from './locations/schemas/location.schema';
import { ReviewDefinition } from './reviews/schemas/review.schema';
import { TripDefinition } from './trips/schemas/trip.schema';
import { UserDefinition } from './users/schemas/user.schema';
import { VehicleDefinition } from './vehicles/schemas/vehicle.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // 1. Lấy Models chuẩn qua Dependency Injection
  const UserModel = app.get<Model<any>>(getModelToken(UserDefinition.name));
  const CompanyModel = app.get<Model<any>>(
    getModelToken(CompanyDefinition.name),
  );
  const VehicleModel = app.get<Model<any>>(
    getModelToken(VehicleDefinition.name),
  );
  const TripModel = app.get<Model<any>>(getModelToken(TripDefinition.name));
  const BookingModel = app.get<Model<any>>(
    getModelToken(BookingDefinition.name),
  );
  const ReviewModel = app.get<Model<any>>(getModelToken(ReviewDefinition.name));
  const LocationModel = app.get<Model<any>>(
    getModelToken(LocationDefinition.name),
  );

  console.log('🌱 SEEDING STARTED...');

  try {
    // 2. Dọn dẹp dữ liệu cũ
    console.log('🧹 Cleaning old data...');
    await Promise.all([
      UserModel.deleteMany({}),
      CompanyModel.deleteMany({}),
      VehicleModel.deleteMany({}),
      TripModel.deleteMany({}),
      BookingModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      LocationModel.deleteMany({}),
    ]);

    const commonPasswordHash = await hashPassword('Password@123');

    // 3. LOCATIONS
    console.log('📍 Seeding Locations...');
    const locationNames = [
      'Hà Nội',
      'Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'Đà Lạt',
      'Nha Trang',
      'Vũng Tàu',
      'Sapa',
      'Huế',
    ];
    const locationsData = locationNames.map((name) => ({
      name: `Bến xe ${name}`,
      province: name,
      fullAddress: `${faker.location.streetAddress()}, ${name}`,
      type: LocationType.BUS_STATION,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(faker.location.longitude().toString()),
          parseFloat(faker.location.latitude().toString()),
        ],
      },
      isActive: true,
      slug:
        faker.helpers.slugify(name).toLowerCase() +
        '-' +
        faker.string.alphanumeric(4), // Slug unique
    }));
    const locations = await LocationModel.insertMany(locationsData);

    // 4. FIXED ACCOUNTS
    console.log('👤 Seeding Fixed Accounts...');
    const fixedAccounts = [
      {
        email: 'admin.test@gmail.com',
        name: 'System Admin',
        phone: '0900000001',
        passwordHash: commonPasswordHash,
        roles: [UserRole.ADMIN],
        isEmailVerified: true,
      },
      {
        email: 'company.test@gmail.com',
        name: 'Fixed Company Admin',
        phone: '0900000002',
        passwordHash: commonPasswordHash,
        roles: [UserRole.COMPANY_ADMIN],
        isEmailVerified: true,
      },
      {
        email: 'user.test@gmail.com',
        name: 'Fixed User',
        phone: '0900000003',
        passwordHash: commonPasswordHash,
        roles: [UserRole.USER],
        isEmailVerified: true,
      },
      {
        email: 'driver.test@gmail.com',
        name: 'Fixed Driver',
        phone: '0900000004',
        passwordHash: commonPasswordHash,
        roles: [UserRole.DRIVER],
        isEmailVerified: true,
      },
    ];
    // Dùng create cho từng cái để đảm bảo nếu 1 cái fail ta biết ngay
    let fixedDriver: any;
    let fixedCompanyAdmin: any;
    for (const acc of fixedAccounts) {
      const u = await UserModel.create(acc);
      if (acc.email.includes('driver')) fixedDriver = u;
      if (acc.email.includes('company')) fixedCompanyAdmin = u;
    }

    // 5. RANDOM POPULATION
    console.log('👥 Seeding Random Users...');
    const randomUsersPayload: any[] = [];

    // 99 Admins
    for (let i = 0; i < 99; i++) {
      randomUsersPayload.push({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        phone: `09${faker.string.numeric(8)}`, // Ensure valid VN phone format
        passwordHash: commonPasswordHash,
        roles: [UserRole.COMPANY_ADMIN],
        isEmailVerified: true,
      });
    }
    // 99 Users
    for (let i = 0; i < 99; i++) {
      randomUsersPayload.push({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        phone: `03${faker.string.numeric(8)}`,
        passwordHash: commonPasswordHash,
        roles: [UserRole.USER],
        isEmailVerified: true,
      });
    }

    // Insert Users với ordered: false để bỏ qua lỗi trùng lặp (nếu faker random trùng)
    const randomUsers = await UserModel.insertMany(randomUsersPayload, {
      ordered: false,
    });

    // Tách mảng user để dùng
    const allCompanyAdmins = [
      fixedCompanyAdmin,
      ...randomUsers.filter((u) => u.roles.includes(UserRole.COMPANY_ADMIN)),
    ];
    const allEndUsers = [
      ...randomUsers.filter((u) => u.roles.includes(UserRole.USER)),
    ];

    // 6. COMPANIES & ASSETS LOOP
    console.log('🏢 Seeding Companies, Vehicles, Trips...');

    // Chỉ chạy tối đa số lượng admin có được
    const totalCompanies = Math.min(100, allCompanyAdmins.length);

    for (let i = 0; i < totalCompanies; i++) {
      const admin = allCompanyAdmins[i];
      const companyCode =
        i === 0 ? 'FUTA' : `CP${faker.string.alphanumeric(4).toUpperCase()}`;

      // A. Create Company
      const companyName =
        i === 0
          ? 'Phuong Trang (FUTA)'
          : `${faker.company.name()} Express ${i}`;

      const company = await CompanyModel.create({
        name: companyName,
        code: companyCode,
        email: `contact.${i}@obtp.local`,
        phone: `028${faker.string.numeric(7)}`,
        status: CompanyStatus.ACTIVE,
        description: faker.lorem.sentence(),
      });

      // Update Admin with CompanyID
      await UserModel.findByIdAndUpdate(admin._id, { companyId: company._id });

      // B. Create Vehicles
      const vehicles: any[] = [];
      const seatMapLayout = Array(10)
        .fill(null)
        .map((_, r) =>
          Array(4)
            .fill(null)
            .map((_, c) => `A${r}${c}`),
        );

      for (let v = 0; v < 2; v++) {
        const vehicle = await VehicleModel.create({
          companyId: company._id,
          vehicleNumber: `${29 + i}A-${faker.string.numeric(5)}`,
          type: 'Sleeper 40',
          status: VehicleStatus.ACTIVE,
          floors: 1,
          seatRows: 10,
          seatColumns: 4,
          totalSeats: 40,
          aislePositions: [2],
          seatMap: { rows: 10, cols: 4, layout: seatMapLayout },
        });
        vehicles.push(vehicle);
      }

      // C. Create Trips
      const tripPayloads: any[] = [];
      const fromLoc = faker.helpers.arrayElement(locations);
      let toLoc = faker.helpers.arrayElement(locations);
      while (toLoc._id.toString() === fromLoc._id.toString())
        toLoc = faker.helpers.arrayElement(locations);

      const createTripData = (isPast: boolean) => {
        const vehicle = faker.helpers.arrayElement(vehicles);
        const depTime = isPast
          ? faker.date.recent({ days: 90 })
          : dayjs()
              .add(faker.number.int({ min: 2, max: 24 }), 'hour')
              .toDate();

        return {
          companyId: company._id,
          vehicleId: vehicle._id,
          driverId: i === 0 ? fixedDriver._id : undefined,
          route: {
            fromLocationId: fromLoc._id,
            toLocationId: toLoc._id,
            stops: [],
            duration: 18000,
            distance: 300000,
          },
          departureTime: depTime,
          expectedArrivalTime: dayjs(depTime).add(5, 'hour').toDate(),
          price: 500000,
          status: isPast ? TripStatus.ARRIVED : TripStatus.SCHEDULED,
          availableSeatsCount: 40,
          seats: Array.from({ length: 40 }).map((_, idx) => ({
            seatNumber: `A${Math.floor(idx / 4)}${idx % 4}`,
            status: SeatStatus.AVAILABLE,
          })),
          isRecurrenceTemplate: false,
        };
      };

      // 10 Past + 2 Active (Giảm số lượng để chạy test nhanh hơn, bạn có thể tăng lại 100 nếu muốn)
      for (let t = 0; t < 10; t++) tripPayloads.push(createTripData(true));
      tripPayloads.push(createTripData(false));
      tripPayloads.push(createTripData(false));

      const createdTrips = await TripModel.insertMany(tripPayloads);

      // D. Bookings & Reviews
      const bookingPayloads: any[] = [];
      const reviewPayloads: any[] = [];

      for (const trip of createdTrips) {
        // Chỉ tạo booking cho trip quá khứ hoặc trip sắp chạy (ngẫu nhiên)
        if (Math.random() > 0.5) continue;

        const user = faker.helpers.arrayElement(allEndUsers) || allEndUsers[0];
        const bookingId = new Types.ObjectId();

        bookingPayloads.push({
          _id: bookingId,
          userId: user._id,
          companyId: company._id,
          tripId: trip._id,
          bookingTime: new Date(),
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          totalAmount: 500000,
          passengers: [
            {
              name: user.name,
              phone: user.phone,
              seatNumber: 'A00',
              price: 500000,
            },
          ],
          contactName: user.name,
          contactPhone: user.phone,
          ticketCode: `TK-${faker.string.alphanumeric(6).toUpperCase()}`,
        });

        if (trip.status === TripStatus.ARRIVED) {
          reviewPayloads.push({
            targetType: 'trip',
            userId: user._id,
            bookingId: bookingId,
            tripId: trip._id,
            companyId: company._id,
            rating: 5,
            comment: 'Good trip',
            displayName: user.name,
            isVisible: true,
          });
        }
      }

      if (bookingPayloads.length)
        await BookingModel.insertMany(bookingPayloads);
      if (reviewPayloads.length) await ReviewModel.insertMany(reviewPayloads);

      if ((i + 1) % 10 === 0) console.log(`✅ Processed ${i + 1} companies`);
    }

    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ SEEDING CRASHED:', error);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
