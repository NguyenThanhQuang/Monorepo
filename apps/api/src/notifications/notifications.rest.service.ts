import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationDefinition,
  NotificationDocument,
} from './schemas/notification.schema';
import {
  NotificationSettingsDefinition,
  NotificationSettingsDocument,
} from './schemas/notification-settings.schema';

@Injectable()
export class NotificationsRestService {
  constructor(
    @InjectModel(NotificationDefinition.name) private readonly notiModel: Model<NotificationDocument>,
    @InjectModel(NotificationSettingsDefinition.name)
    private readonly settingsModel: Model<NotificationSettingsDocument>,
  ) {}

  async list(userId: string, page = 1, limit = 20) {
    const uid = new Types.ObjectId(userId);
    const skip = Math.max(0, (page - 1) * limit);
    const [items, total] = await Promise.all([
      this.notiModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.max(1, Math.min(100, limit)))
        .lean()
        .exec(),
      this.notiModel.countDocuments({ userId: uid }).exec(),
    ]);
    return { ok: true, items, page, limit, total };
  }

  async markRead(userId: string, id: string) {
    const uid = new Types.ObjectId(userId);
    const doc = await this.notiModel
      .findOneAndUpdate({ _id: id, userId: uid }, { $set: { isRead: true } }, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Notification not found');
    return { ok: true, item: doc };
  }

  async markAllRead(userId: string) {
    const uid = new Types.ObjectId(userId);
    await this.notiModel.updateMany({ userId: uid, isRead: false }, { $set: { isRead: true } }).exec();
    return { ok: true };
  }

  async remove(userId: string, id: string) {
    const uid = new Types.ObjectId(userId);
    const res = await this.notiModel.deleteOne({ _id: id, userId: uid }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Notification not found');
    return { ok: true };
  }

  async unreadCount(userId: string) {
    const uid = new Types.ObjectId(userId);
    const count = await this.notiModel.countDocuments({ userId: uid, isRead: false }).exec();
    return { ok: true, count };
  }

  async getSettings(userId: string) {
    const uid = new Types.ObjectId(userId);
    const doc = await this.settingsModel.findOneAndUpdate(
      { userId: uid },
      { $setOnInsert: { marketing: true, system: true, booking: true } },
      { upsert: true, new: true },
    ).lean().exec();
    return { ok: true, settings: doc };
  }

  async updateSettings(userId: string, payload: any) {
    const uid = new Types.ObjectId(userId);
    const doc = await this.settingsModel.findOneAndUpdate(
      { userId: uid },
      {
        $set: {
          marketing: payload?.marketing ?? true,
          system: payload?.system ?? true,
          booking: payload?.booking ?? true,
        },
      },
      { upsert: true, new: true },
    ).lean().exec();
    return { ok: true, settings: doc };
  }
}
