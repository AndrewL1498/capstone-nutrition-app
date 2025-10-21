import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const getDataFromToken = (request: NextRequest) => {
    try{

        const token = request.cookies.get('token')?.value || ''; //The question mark (?) checks if the token in the cookie exists, and if it doesn't it returns undefined instead of throwing an error
        jwt.verify(token, process.env.JWT_SECRET!);

    } catch (error: any) {
        throw new Error("error.message");
    }
}