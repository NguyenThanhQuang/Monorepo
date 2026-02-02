import { Module } from '@nestjs/common';
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
    UsersModule,
    MailModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
