import { HttpException, HttpStatus } from '@nestjs/common';

export class ExternalServiceException extends HttpException {
  constructor(
    serviceName: string,
    originalError?: any,
    status: HttpStatus = HttpStatus.SERVICE_UNAVAILABLE,
  ) {
    super(
      {
        message: `${serviceName} service is currently unavailable`,
        errorCode: 'EXTERNAL_SERVICE_ERROR',
        service: serviceName,
        originalError: originalError?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        path: '',
      },
      status,
    );
  }
}