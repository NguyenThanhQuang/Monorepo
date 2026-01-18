// import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
// import { NextFunction, Request, Response } from 'express';

// @Injectable()
// export class AdminLoginLoggerMiddleware implements NestMiddleware {
//   private readonly logger = new Logger('AdminLoginAttempt');

//   use(req: Request, res: Response, next: NextFunction) {
//     const sourceHeader = req.headers['x-request-source'];

//     // Placeholder Logic: Chỉ log nếu có header 'admin-portal'
//     // Cần cẩn thận log IP trong môi trường Production (cần tuân thủ GDPR/Privacy nếu lưu trữ)
//     if (sourceHeader === 'admin-portal') {
//       const userAgent = req.headers['user-agent'] || 'unknown';
//       this.logger.log(
//         `[ADMIN PORTAL] Login attempt. IP: ${req.ip}, UA: ${userAgent}`,
//       );
//     }
//     next();
//   }
// }
