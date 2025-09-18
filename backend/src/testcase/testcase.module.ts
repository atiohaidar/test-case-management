import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCaseService } from './testcase.service';
import { TestCaseController } from './testcase.controller';
import { TestCase } from './entities/testcase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase])],
  controllers: [TestCaseController],
  providers: [TestCaseService],
})
export class TestCaseModule {}