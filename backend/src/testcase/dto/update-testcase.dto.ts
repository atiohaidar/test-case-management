import { PartialType } from '@nestjs/mapped-types';
import { CreateTestCaseDto } from './create-testcase.dto';

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}