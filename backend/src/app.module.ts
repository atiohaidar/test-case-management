import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestCaseModule } from './testcase/testcase.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TestCaseModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule { }