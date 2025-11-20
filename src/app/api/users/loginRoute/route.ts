import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
 

connect()

export async function POST(request: NextRequest) {
    try{
        const reqBody = await request.json()
        const {email, password} = reqBody;

        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const user = await User.findOne({email: normalizedEmail})
        if(!user) {
            return NextResponse.json({message: "User not found"}, {status: 400})
        }
        // Check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword) {
            return NextResponse.json({message: "Invalid password"}, {status: 400})
        }
        
        //create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        //create token
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: '1d'}); // '!' asserts that TOKEN_SECRET is not undefined. Takes 3 arguments: payload, secret, options
        const response = NextResponse.json({
            message: "Login successful",
            success: true // indicates that the login was successful and sends a 200 status code by default. This is useful for the client to know that the request was processed successfully. It's not understood by browsers but can be used by client-side code to handle responses appropriately.
    })

        // Set cookie
        response.cookies.set("token", token, { // "token" is the name of the cookie, token is the value of the cookie
            httpOnly: true, // prevents client-side JavaScript from accessing the cookie, enhancing security against XSS attacks.
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, 
        {status: 500})
    }
}