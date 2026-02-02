import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthUserResponse,
  BookingStatus,
  CreatePaymentLinkPayload,
  PaymentLinkResponse,
  PaymentStatus,
  PayOSCode,
  PayOSWebhookPayload,
} from '@obtp/shared-types';
import PayOS from '@payos/node';

import {
  formatPaymentDescription,
  generatePaymentOrderCode,
} from '@obtp/business-logic';
import { BookingsRepository } from '../bookings/bookings.repository';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);
  private payOS: any;
  private readonly clientBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly bookingsService: BookingsService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly paymentsRepository: PaymentsRepository,
  ) {
    this.clientBaseUrl = this.configService.getOrThrow<string>('CLIENT_URL');
  }

  onModuleInit() {
    const PayOSClass = PayOS as any;

    this.payOS = new PayOSClass(
      this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
      this.configService.getOrThrow<string>('PAYOS_API_KEY'),
      this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
    );
  }

  async createPaymentLink(
    payload: CreatePaymentLinkPayload,
    user?: AuthUserResponse,
  ): Promise<PaymentLinkResponse> {
    const { bookingId } = payload;
    this.logger.log(`Creating payment link for booking: ${bookingId}`);

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');
    if (booking.status !== BookingStatus.HELD) {
      throw new BadRequestException(
        'Trạng thái đơn hàng không hợp lệ (Phải là HELD).',
      );
    }

    if (booking.userId && user) {
      if (booking.userId.toString() !== user.id) {
        throw new ForbiddenException('Không có quyền thanh toán đơn này.');
      }
    }

    const now = Date.now();
    if (!booking.heldUntil || new Date(booking.heldUntil).getTime() < now) {
      throw new BadRequestException('Đơn hàng đã hết hạn giữ chỗ.');
    }

    const orderCode = generatePaymentOrderCode();
    const description = formatPaymentDescription(orderCode);

    booking.paymentOrderCode = orderCode;
    await this.bookingsRepository.save(booking);

    const expiredAt = Math.floor(new Date(booking.heldUntil).getTime() / 1000);

    const paymentData = {
      orderCode: orderCode,
      amount: booking.totalAmount,
      description: description,
      cancelUrl: `${this.clientBaseUrl}/payment/cancel?bookingId=${bookingId}`,
      returnUrl: `${this.clientBaseUrl}/payment/success?bookingId=${bookingId}`,
      expiredAt: expiredAt,
    };

    await this.paymentsRepository.create({
      orderCode: orderCode,
      bookingId: booking._id,
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
      description: description,
    });

    try {
      const paymentLink = await this.payOS.createPaymentLink(paymentData);

      return {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: paymentLink.orderCode,
        qrCode: paymentLink.qrCode,
      };
    } catch (error) {
      this.logger.error('Failed to create PayOS link:', error);
      throw new InternalServerErrorException('Lỗi khởi tạo cổng thanh toán.');
    }
  }

  async handleWebhook(payload: PayOSWebhookPayload): Promise<void> {
    if (!payload || !payload.data || !payload.signature) {
      this.logger.warn('Webhook received empty data or missing signature.');
      return;
    }

    const { data, signature } = payload;

    if (!this.verifyWebhookSignature(data, signature)) {
      this.logger.error(
        `Webhook Signature Invalid! OrderCode: ${data.orderCode}`,
      );
      return;
    }

    this.logger.log(
      `Webhook Signature OK. OrderCode: ${data.orderCode} Code: ${payload.code}`,
    );

    if (payload.code !== PayOSCode.SUCCESS) {
      await this.updateTransactionStatus(
        data.orderCode,
        PaymentStatus.FAILED,
        data,
      );
      return;
    }

    const transaction = await this.paymentsRepository.findByOrderCode(
      data.orderCode,
    );
    let bookingIdString = '';

    if (transaction) {
      bookingIdString = transaction.bookingId.toString();

      await this.updateTransactionStatus(
        data.orderCode,
        PaymentStatus.PAID,
        data,
      );
    } else {
      this.logger.warn(
        `Transaction not found for OrderCode: ${data.orderCode}`,
      );
      return;
    }

    try {
      if (bookingIdString) {
        await this.bookingsService.confirmBooking(bookingIdString, {
          paidAmount: data.amount,
          paymentMethod: 'PayOS',
          transactionDateTime:
            data.transactionDateTime || new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to confirm booking logic via Webhook: ${errorMessage}`,
      );
    }
  }

  private async updateTransactionStatus(
    orderCode: number,
    status: PaymentStatus,
    rawData: any,
  ) {
    const tx = await this.paymentsRepository.findByOrderCode(orderCode);
    if (tx) {
      tx.status = status;
      tx.rawWebhookData = rawData;
      tx.transactionDateTime = rawData.transactionDateTime;
      tx.accountNumber = rawData.accountNumber;
      await this.paymentsRepository.save(tx);
    }
  }

  private verifyWebhookSignature(
    data: any,
    incomingSignature: string,
  ): boolean {
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');
    if (!checksumKey) return false;
    try {
      return this.payOS.verifyPaymentWebhookData(data);
    } catch (e) {
      this.logger.warn(`PayOS Library verify failed, fallback? ${e}`);
      return false;
    }
  }
}
