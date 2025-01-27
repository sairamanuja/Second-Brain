import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user: {
                Id: string;
            }
            userId?: string;
        }
    }
} 