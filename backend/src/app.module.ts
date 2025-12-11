import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestCaseModule } from './testcase/testcase.module';
import { PrismaService } from './prisma/prisma.service';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TestCaseModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule { }