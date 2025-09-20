import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    errorCode?: string,
  ) {
    super(
      {
        message,
        errorCode: errorCode || 'BUSINESS_ERROR',
        timestamp: new Date().toISOString(),
        path: '', // Will be set by the filter
      },
      status,
    );
  }
}