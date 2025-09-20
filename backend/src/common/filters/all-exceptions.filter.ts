import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationException } from '../exceptions';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let details: any = null;

    // Handle HttpException (including our custom exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        errorCode = responseObj.errorCode || this.getErrorCodeFromStatus(status);
        details = responseObj.errors || responseObj.originalError || null;

        // Update path if not set
        if (!responseObj.path) {
          responseObj.path = request.url;
        }
      }
    }
    // Handle ValidationException specifically
    else if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errorCode = 'VALIDATION_ERROR';
      details = (exception as any).errors;
    }
    // Handle other exceptions
    else if (exception instanceof Error) {
      message = 'An unexpected error occurred';
      errorCode = 'UNEXPECTED_ERROR';
      details = process.env.NODE_ENV === 'development' ? exception.message : undefined;
    }

    // Log the error
    this.logError(exception, request, status);

    // Send standardized response
    const errorResponse = {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';

    const logData = {
      method,
      url,
      ip,
      userAgent,
      status,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : '',
        logData,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        logData,
      );
    } else {
      this.logger.log(
        `Request: ${method} ${url} - ${status}`,
        logData,
      );
    }
  }
}