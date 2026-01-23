// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   InternalServerErrorException,
//   Logger,
//   NotFoundException,
//   OnModuleInit,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//   AuthUserResponse,
//   BookingStatus,
//   CreatePaymentLinkPayload,
//   PaymentStatus,
//   PayOSCode,
//   PayOSWebhookPayload,
// } from '@obtp/shared-types';

// // [FIX 1 & 2]: Chuyển sang Default Import để dùng được cả làm Type và Constructor
// import PayOS from '@payos/node';

// import * as crypto from 'crypto';

// import {
//   formatPaymentDescription,
//   generatePaymentOrderCode,
// } from '@obtp/business-logic';
// import { BookingsRepository } from '../bookings/bookings.repository';
// import { BookingsService } from '../bookings/bookings.service';
// import { PaymentsRepository } from './payments.repository';

// @Injectable()
// export class PaymentsService implements OnModuleInit {
//   private readonly logger = new Logger(PaymentsService.name);

//   private payOS: PayOS;
//   private readonly clientBaseUrl: string;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly bookingsService: BookingsService,
//     private readonly bookingsRepository: BookingsRepository,
//     private readonly paymentsRepository: PaymentsRepository,
//   ) {
//     this.clientBaseUrl = this.configService.getOrThrow<string>('CLIENT_URL');
//   }

//   onModuleInit() {
//     this.payOS = new PayOS(
//       this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
//       this.configService.getOrThrow<string>('PAYOS_API_KEY'),
//       this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
//     );
//   }

//   // --- 1. CREATE PAYMENT LINK ---

//   async createPaymentLink(
//     payload: CreatePaymentLinkPayload,
//     user?: AuthUserResponse,
//   ): Promise<any> {
//     const { bookingId } = payload;
//     this.logger.log(`Creating payment link for booking: ${bookingId}`);

//     const booking = await this.bookingsRepository.findById(bookingId);

//     if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');
//     if (booking.status !== BookingStatus.HELD) {
//       throw new BadRequestException(
//         'Trạng thái đơn hàng không hợp lệ (Phải là HELD).',
//       );
//     }

//     if (booking.userId && user) {
//       if (booking.userId.toString() !== user.id) {
//         throw new ForbiddenException('Không có quyền thanh toán đơn này.');
//       }
//     }

//     if (!booking.heldUntil || booking.heldUntil.getTime() < Date.now()) {
//       throw new BadRequestException('Đơn hàng đã hết hạn giữ chỗ.');
//     }

//     const orderCode = generatePaymentOrderCode();
//     const description = formatPaymentDescription(orderCode);

//     booking.paymentOrderCode = orderCode;
//     await this.bookingsRepository.save(booking);

//     const expiredAt = Math.floor(booking.heldUntil.getTime() / 1000);

//     const paymentData = {
//       orderCode: orderCode,
//       amount: booking.totalAmount,
//       description: description,
//       cancelUrl: `${this.clientBaseUrl}/payment/cancel?bookingId=${bookingId}`,
//       returnUrl: `${this.clientBaseUrl}/payment/success?bookingId=${bookingId}`,
//       expiredAt: expiredAt,
//     };

//     await this.paymentsRepository.create({
//       orderCode: orderCode,
//       bookingId: booking._id,
//       amount: booking.totalAmount,
//       status: PaymentStatus.PENDING,
//       description: description,
//     });

//     try {
//       const paymentLink = await this.payOS.createPaymentLink(paymentData);
//       return paymentLink;
//     } catch (error) {
//       this.logger.error('Failed to create PayOS link:', error);
//       throw new InternalServerErrorException('Lỗi khởi tạo thanh toán.');
//     }
//   }

//   // --- 2. HANDLE WEBHOOK ---

//   async handleWebhook(payload: PayOSWebhookPayload): Promise<void> {
//     if (!payload || !payload.data || !payload.signature) {
//       this.logger.warn('Webhook received empty data or missing signature.');
//       return;
//     }

//     const { data, signature } = payload;

//     if (!this.verifyWebhookSignature(data, signature)) {
//       this.logger.error(
//         `Webhook Signature Invalid! OrderCode: ${data.orderCode}`,
//       );
//       return;
//     }

//     if (payload.code !== PayOSCode.SUCCESS) {
//       await this.updateTransactionStatus(
//         data.orderCode,
//         PaymentStatus.FAILED,
//         data,
//       );
//       return;
//     }

//     this.logger.log(
//       `Webhook Validated. Processing success for Order: ${data.orderCode}`,
//     );

//     const transaction = await this.paymentsRepository.findByOrderCode(
//       data.orderCode,
//     );

//     try {
//       let bookingId = '';
//       if (transaction) {
//         bookingId = transaction.bookingId.toString();
//       } else {
//         const b = await (this.bookingsRepository as any).bookingModel.findOne({
//           paymentOrderCode: data.orderCode,
//         });
//         if (b) bookingId = b._id.toString();
//       }

//       if (bookingId) {
//         await this.bookingsService.confirmBooking(bookingId, {
//           paidAmount: data.amount,
//           paymentMethod: 'PayOS',
//           transactionDateTime: data.transactionDateTime,
//         });

//         await this.updateTransactionStatus(
//           data.orderCode,
//           PaymentStatus.PAID,
//           data,
//         );
//       } else {
//         this.logger.error(`Booking not found for orderCode: ${data.orderCode}`);
//       }
//     } catch (error) {
//       // [FIX 3]: Handle 'unknown' type error explicitly
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);
//       this.logger.error(
//         `Failed to confirm booking from Webhook: ${errorMessage}`,
//       );
//     }
//   }

//   private async updateTransactionStatus(
//     orderCode: number,
//     status: PaymentStatus,
//     rawData: any,
//   ) {
//     const tx = await this.paymentsRepository.findByOrderCode(orderCode);
//     if (tx) {
//       tx.status = status;
//       tx.rawWebhookData = rawData;
//       tx.transactionDateTime = rawData.transactionDateTime;
//       tx.accountNumber = rawData.accountNumber;
//       await this.paymentsRepository.save(tx);
//     }
//   }

//   private verifyWebhookSignature(
//     data: any,
//     incomingSignature: string,
//   ): boolean {
//     const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');
//     if (!checksumKey) return false;

//     const sortedKeys = Object.keys(data).sort();
//     const dataParts: string[] = [];
//     for (const key of sortedKeys) {
//       const val = data[key];
//       if (val === undefined || val === null) {
//         continue;
//       }
//       const valStr = String(val);
//       dataParts.push(`${key}=${valStr}`);
//     }

//     const dataToSign = dataParts.join('&');
//     const generatedSignature = crypto
//       .createHmac('sha256', checksumKey)
//       .update(dataToSign)
//       .digest('hex');

//     return generatedSignature === incomingSignature;
//   }
// }
