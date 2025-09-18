import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCaseModule } from './testcase/testcase.module';
import { TestCase } from './testcase/entities/testcase.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'testcase_management',
      entities: [TestCase],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    }),
    TestCaseModule,
  ],
})
export class AppModule {}