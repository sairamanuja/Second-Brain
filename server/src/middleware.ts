import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_PASSWORD = "MANISH12";
// @ts-ignore
export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "No token provided or invalid format"
        });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after 'Bearer '
    
    try {
        const decoded = jwt.verify(token, JWT_PASSWORD);
        if (typeof decoded === "string" || !decoded.id) {
            return res.status(403).json({
                message: "Invalid token"
            });
        }
        req.userId = decoded.id;
        req.user = { Id: decoded.id }; // Set both userId and user.Id
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }
}