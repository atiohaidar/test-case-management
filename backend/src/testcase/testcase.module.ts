import { Module } from '@nestjs/common';
import { TestCaseService } from './testcase.service';
import { TestCaseController } from './testcase.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TestCaseController],
  providers: [TestCaseService, PrismaService],
})
export class TestCaseModule { }