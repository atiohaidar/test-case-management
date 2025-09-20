import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-09-20T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/testcases',
    required: false,
  })
  path?: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    path?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }

  static success<T>(
    data: T,
    message = 'Operation completed successfully',
    path?: string,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, path);
  }

  static error(
    message: string,
    path?: string,
    errorCode?: string,
  ): ApiResponseDto<null> {
    const response = new ApiResponseDto(false, message, null, path);
    (response as any).errorCode = errorCode;
    return response;
  }
}