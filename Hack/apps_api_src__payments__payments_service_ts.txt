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
    // @payos/node v2.x
    const { PayOS } = require('@payos/node');

    this.payOS = new PayOS({
      clientId: this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
      apiKey: this.configService.getOrThrow<string>('PAYOS_API_KEY'),
      checksumKey: this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
    });

    this.logger.log('PayOS Initialized Successfully');
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
    // ✅ nếu đã có orderCode, thử lấy lại thông tin link để khỏi tạo order mới
    if (booking.paymentOrderCode) {
      try {
        const resp = await this.payOS.get(
          `/v2/payment-requests/${booking.paymentOrderCode}`,
        );
        const info = (resp as any)?.data ?? resp;

        const st = String(info?.status ?? '').toUpperCase();
        // nếu vẫn pending thì trả lại link cũ
        if (st === 'PENDING' && info?.checkoutUrl) {
          return {
            checkoutUrl: info.checkoutUrl,
            orderCode: info.orderCode ?? booking.paymentOrderCode,
            qrCode: info.qrCode,
          };
        }
      } catch {
        // ignore -> sẽ tạo link mới
      }
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
      const paymentLink = await this.payOS.paymentRequests.create(paymentData);

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

    if (!(await this.verifyWebhookSignature(payload))) {
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

  private async verifyWebhookSignature(
    payload: PayOSWebhookPayload,
  ): Promise<boolean> {
    try {
      await this.payOS.webhooks.verify(payload);
      return true;
    } catch (e) {
      this.logger.warn(`PayOS webhook verify failed: ${e}`);
      return false;
    }
  }

  async syncPaymentByBookingId(bookingId: string, user?: AuthUserResponse) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');

    if (booking.userId && user && booking.userId.toString() !== user.id) {
      throw new ForbiddenException('Không có quyền kiểm tra đơn này.');
    }

    if (!booking.paymentOrderCode) {
      return { ok: false, message: 'Đơn chưa có mã thanh toán PayOS.' };
    }

    const resp = await this.payOS.get(
      `/v2/payment-requests/${booking.paymentOrderCode}`,
    );
    const info = (resp as any)?.data ?? resp;
    const payStatus = String(info?.status ?? '').toUpperCase();

    // PAID -> confirm booking + sinh ticketCode
    if (payStatus === 'PAID') {
      await this.bookingsService.confirmBooking(bookingId, {
        paidAmount: Number(info?.amount ?? booking.totalAmount),
        paymentMethod: 'PayOS',
        transactionDateTime:
          info?.transactionDateTime || new Date().toISOString(),
      });
      return { ok: true, status: 'PAID' };
    }

    // CANCELLED/EXPIRED -> cancel hold + nhả ghế
    if (payStatus === 'CANCELLED' || payStatus === 'EXPIRED') {
      await this.bookingsService.cancelExpiredHoldSystem(bookingId);
      return { ok: true, status: payStatus };
    }

    return { ok: true, status: payStatus || 'PENDING' };
  }

  async devConfirmPayment(bookingId: string, user?: AuthUserResponse) {
    if (this.configService.get<string>('PAYMENT_DEV_MODE') !== 'true') {
      throw new ForbiddenException(
        'DEV confirm đang tắt. Bật PAYMENT_DEV_MODE=true để dùng.',
      );
    }

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Đơn hàng không tồn tại.');

    if (booking.status !== BookingStatus.HELD) {
      throw new BadRequestException('Chỉ DEV-confirm được đơn đang HELD.');
    }

    if (booking.userId && user && booking.userId.toString() !== user.id) {
      throw new ForbiddenException('Không có quyền confirm đơn này.');
    }

    // nếu quá hạn giữ chỗ thì không cho confirm giả
    const now = Date.now();
    if (!booking.heldUntil || new Date(booking.heldUntil).getTime() < now) {
      throw new BadRequestException('Đơn hàng đã hết hạn giữ chỗ.');
    }

    // cập nhật payment record (DEV) cho sạch
    const orderCode = booking.paymentOrderCode ?? generatePaymentOrderCode();
    booking.paymentOrderCode = orderCode;
    await this.bookingsRepository.save(booking);

    let tx = await this.paymentsRepository.findByOrderCode(orderCode);
    if (!tx) {
      tx = await this.paymentsRepository.create({
        orderCode,
        bookingId: booking._id,
        amount: booking.totalAmount,
        status: PaymentStatus.PENDING,
        description: formatPaymentDescription(orderCode),
        paymentMethod: 'DEV',
      });
    }
    tx.status = PaymentStatus.PAID;
    tx.paymentMethod = 'DEV';
    tx.transactionDateTime = new Date().toISOString();
    await this.paymentsRepository.save(tx);

    // ✅ điểm quan trọng: gọi confirmBooking để sinh ticketCode + BOOKED ghế
    const confirmed = await this.bookingsService.confirmBooking(bookingId, {
      paidAmount: booking.totalAmount,
      paymentMethod: 'DEV',
      transactionDateTime: new Date().toISOString(),
    });

    return { ok: true, status: 'PAID', ticketCode: confirmed.ticketCode };
  }
}
