// src/modules/companies/companies.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { CompaniesService } from './companies.service';
import { CompanyDefinition, CompanySchema } from './schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyDefinition.name, schema: CompanySchema },
    ]),
    forwardRef(() => UsersModule), // Thêm forwardRef để tránh circular dependency
    MailModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [
    CompaniesService, 
    CompaniesRepository,
    MongooseModule, // THÊM: Export MongooseModule để các module khác có thể dùng model Company
  ],
})
export class CompaniesModule {}