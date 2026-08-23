import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { InventoryModule } from './inventory/inventory.module';
import { LabourModule } from './labour/labour.module';
import { ExpenseModule } from './expense/expense.module';
import { AuthModule } from './auth/auth.module';
import { UnitModule } from './unit/unit.module';
import { CustomerModule } from './customer/customer.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LedgerModule } from './ledger/ledger.module';
import { BudgetModule } from './budget/budget.module';
import { ConfigModule } from '@nestjs/config';
import { BuildingModule } from './unit/building.module';
import { WingModule } from './unit/wing.module';
import { DailyReportModule } from './daily-report/daily-report.module';
import { TaskModule } from './task/task.module';
import { LeadModule } from './lead/lead.module';
import { CompanyReportsModule } from './company-reports/company-reports.module';
import { InstallmentsModule } from './installments/installments.module';
import { KycModule } from './kyc/kyc.module';
import { DocumentModule } from './document/document.module';
import { UploadModule } from './upload/upload.module';
import { VendorModule } from './vendor/vendor.module';
import { BrokerModule } from './broker/broker.module';
import { FinanceModule } from './finance/finance.module';
import { LandModule } from './land/land.module';
import { ReminderModule } from './reminder/reminder.module';
import { MarketingModule } from './marketing/marketing.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔥 important
    }),
    PrismaModule,
    ProjectModule,
    InventoryModule,
    LabourModule,
    ExpenseModule,
    AuthModule,
    UnitModule,
    CustomerModule,
    BookingModule,
    PaymentModule,
    DashboardModule,
    LedgerModule,
    BudgetModule,
    BuildingModule,
    WingModule,
    DailyReportModule,
    TaskModule,
    LeadModule,
    CompanyReportsModule,
    InstallmentsModule,
    KycModule,
    DocumentModule,
    UploadModule,
    VendorModule,
    BrokerModule,
    FinanceModule,
    LandModule,
    ReminderModule,
    MarketingModule,
  ],
})
export class AppModule {}
