import {
  BookingConfirmationEmailPayload,
  EmailContext,
} from "@obtp/shared-types";

/**
 * Tạo nội dung Email xác thực tài khoản (User)
 */
export function generateVerificationEmail(
  name: string,
  context: EmailContext,
): { subject: string; html: string } {
  const { appName, verifyTokenUrl, expireText } = context;

  const subject = `Xác thực địa chỉ Email cho ${appName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #007bff;">Chào ${name},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>${appName}</strong>.</p>
        <p>Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${verifyTokenUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Xác thực Email của tôi</a>
        </p>
        <p>Nếu nút trên không hoạt động, bạn cũng có thể sao chép và dán URL sau vào thanh địa chỉ của trình duyệt:</p>
        <p style="word-break: break-all;"><a href="${verifyTokenUrl}" style="color: #007bff;">${verifyTokenUrl}</a></p>
        <p>Liên kết xác thực này sẽ có hiệu lực trong vòng <strong>${expireText || "24 giờ"}</strong>.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.9em; color: #777;">Trân trọng,<br>Đội ngũ ${appName}</p>
      </div>
    </div>
  `;
  return { subject, html };
}

/**
 * Tạo nội dung Email Reset Password
 */
export function generatePasswordResetEmail(
  name: string,
  context: EmailContext,
): { subject: string; html: string } {
  const { appName, resetPasswordUrl, expireText } = context;

  const subject = `Yêu cầu Đặt lại Mật khẩu cho ${appName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #dc3545;">Chào ${name},</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>${appName}</strong>.</p>
        <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetPasswordUrl}" style="background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Đặt lại Mật khẩu</a>
        </p>
        <p style="word-break: break-all;"><a href="${resetPasswordUrl}" style="color: #dc3545;">${resetPasswordUrl}</a></p>
        <p>Liên kết này có hiệu lực trong vòng <strong>${expireText || "1 giờ"}</strong>.</p>
      </div>
    </div>
  `;
  return { subject, html };
}

/**
 * Tạo nội dung Email Booking thành công
 */
export function generateBookingSuccessEmail(
  payload: BookingConfirmationEmailPayload,
  appName: string,
): { subject: string; html: string } {
  const subject = `[${appName}] Xác nhận đặt vé thành công - Mã vé: ${payload.ticketCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1>Cảm ơn bạn đã đặt vé!</h1>
      <p>Chào <strong>${payload.customerName}</strong>,</p>
      <p>Đơn đặt vé của bạn đã được xác nhận thành công. Chi tiết:</p>
      <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Mã vé:</strong> <span style="font-size: 1.2em; color: #d9534f; font-weight: bold;">${payload.ticketCode}</span></li>
        <li style="margin-bottom: 10px;"><strong>Hành trình:</strong> ${payload.routeName}</li>
        <li style="margin-bottom: 10px;"><strong>Nhà xe:</strong> ${payload.companyName}</li>
        <li style="margin-bottom: 10px;"><strong>Khởi hành:</strong> ${payload.departureTime}</li>
        <li style="margin-bottom: 10px;"><strong>Số ghế:</strong> ${payload.seatNumbers}</li>
        <li style="margin-bottom: 10px;"><strong>Tổng tiền:</strong> ${payload.totalAmount} VNĐ</li>
      </ul>
      <p>Vui lòng có mặt tại điểm đi trước 30 phút.</p>
      <hr>
      <p style="font-size: 0.8em; color: #777;">Email tự động từ ${appName}.</p>
    </div>
  `;

  return { subject, html };
}

/**
 * Tạo nội dung Email Activate cho Admin Company
 */
export function generateCompanyAdminActivationEmail(
  name: string,
  context: EmailContext,
): { subject: string; html: string } {
  const { appName, verifyTokenUrl } = context;

  const subject = `[${appName}] Kích hoạt tài khoản Quản trị Nhà xe của bạn`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Chào ${name},</h2>
      <p>Một tài khoản quản trị nhà xe đã được tạo cho bạn trên hệ thống <strong>${appName}</strong>.</p>
      <p>Để hoàn tất, vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản và đặt mật khẩu:</p>
      <p style="text-align: center;">
          <a href="${verifyTokenUrl}">Kích hoạt Tài khoản & Đặt Mật khẩu</a>
      </p>
      <p>Liên kết này có hiệu lực trong vòng 24 giờ.</p>
    </div>
  `;
  return { subject, html };
}

/**
 * Tạo nội dung Email Promote (Thăng cấp quyền Admin)
 */
export function generateCompanyAdminPromotionEmail(
  name: string,
  companyName: string,
  context: EmailContext,
): { subject: string; html: string } {
  const { appName, loginUrl } = context;

  const subject = `[${appName}] Tài khoản của bạn đã được nâng cấp quyền`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
        <h2>Chào ${name},</h2>
        <p>Tài khoản của bạn trên hệ thống <strong>${appName}</strong> đã được cấp quyền Quản trị cho nhà xe <strong>${companyName}</strong>.</p>
        <p>Bạn có thể đăng nhập ngay bây giờ bằng mật khẩu hiện tại.</p>
        <p style="text-align: center;">
            <a href="${loginUrl}">Đăng nhập ngay</a>
        </p>
    </div>
  `;
  return { subject, html };
}
