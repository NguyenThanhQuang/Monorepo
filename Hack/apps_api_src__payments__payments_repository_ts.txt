import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
} from './schemas/payment-transaction.schema';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectModel(PaymentTransaction.name)
    private readonly transactionModel: Model<PaymentTransactionDocument>,
  ) {}

  async create(
    doc: Partial<PaymentTransaction>,
    session?: ClientSession,
  ): Promise<PaymentTransactionDocument> {
    const newTx = new this.transactionModel(doc);
    return newTx.save({ session });
  }

  async findByOrderCode(
    orderCode: number,
  ): Promise<PaymentTransactionDocument | null> {
    return this.transactionModel.findOne({ orderCode }).exec();
  }

  async save(
    doc: PaymentTransactionDocument,
    session?: ClientSession,
  ): Promise<PaymentTransactionDocument> {
    return doc.save({ session });
  }
}
