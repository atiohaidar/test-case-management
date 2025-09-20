import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(validationErrors: ValidationError[]) {
    const formattedErrors = validationErrors.map(error => ({
      field: error.property,
      constraints: error.constraints,
      children: error.children,
    }));

    super(
      {
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
        path: '',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}