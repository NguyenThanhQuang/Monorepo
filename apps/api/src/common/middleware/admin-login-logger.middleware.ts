import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AdminLoginLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AccessLog');

  use(req: Request, res: Response, next: NextFunction) {
    const sourceHeader = req.headers['x-request-source'];

    // Logging only specific significant actions if strictly required
    if (sourceHeader === 'admin-portal' && req.path.includes('login')) {
      this.logger.log(
        `[ADMIN] Login attempt | IP: ${req.ip} | Agent: ${req.headers['user-agent']}`,
      );
    }
    next();
  }
}
