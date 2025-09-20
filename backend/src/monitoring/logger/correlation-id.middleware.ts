import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Generate correlation ID if not provided
        const correlationId = req.headers['x-correlation-id'] as string || uuidv4();

        // Add correlation ID to request object for use in services
        (req as any).correlationId = correlationId;

        // Add correlation ID to response headers
        res.setHeader('x-correlation-id', correlationId);

        // Add correlation ID to async local storage for logging
        if (global.AsyncLocalStorage) {
            const asyncLocalStorage = (global as any).asyncLocalStorage;
            if (asyncLocalStorage) {
                const store = asyncLocalStorage.getStore();
                if (store) {
                    store.set('correlationId', correlationId);
                }
            }
        }

        next();
    }
}