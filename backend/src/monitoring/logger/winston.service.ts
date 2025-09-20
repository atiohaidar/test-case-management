import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'test-case-management' },
            transports: [
                // Console transport for development
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),

                // File transport for all logs
                new DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),

                // Separate file for errors
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            ]
        });
    }

    log(message: string, context?: string, correlationId?: string) {
        const meta = correlationId ? { correlationId, context } : { context };
        this.logger.info(message, meta);
    }

    error(message: string, trace?: string, context?: string, correlationId?: string) {
        const meta = correlationId ? { correlationId, context, trace } : { context, trace };
        this.logger.error(message, meta);
    }

    warn(message: string, context?: string, correlationId?: string) {
        const meta = correlationId ? { correlationId, context } : { context };
        this.logger.warn(message, meta);
    }

    debug(message: string, context?: string, correlationId?: string) {
        const meta = correlationId ? { correlationId, context } : { context };
        this.logger.debug(message, meta);
    }

    verbose(message: string, context?: string, correlationId?: string) {
        const meta = correlationId ? { correlationId, context } : { context };
        this.logger.verbose(message, meta);
    }

    // Method to add correlation ID to all subsequent logs in the same request
    setCorrelationId(correlationId: string) {
        // This would be used by the correlation middleware
        this.logger.defaultMeta = {
            ...this.logger.defaultMeta,
            correlationId
        };
    }

    // Method to clear correlation ID
    clearCorrelationId() {
        const { correlationId, ...rest } = this.logger.defaultMeta;
        this.logger.defaultMeta = rest;
    }
}