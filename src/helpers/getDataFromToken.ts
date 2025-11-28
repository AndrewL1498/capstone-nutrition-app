import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const getDataFromToken = (request: NextRequest) => {
    try{

        const token = request.cookies.get('token')?.value; //The question mark (?) checks if the token in the cookie exists
        
        if(!token) return null;

        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!); //Verify takes two arguments, the token and the secret key used to sign the token. We do type of any because we don't know the structure of the decoded token yet.
        return decodedToken.id;

    } catch (error: any) {
        return null;
    }
}