import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
 

connect()

export async function POST(request: NextRequest) {
    try{
        const reqBody = await request.json()
        const {email, password} = reqBody;

        // Check if user exists
        const user = await User.findOne({email})
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

    } catch (error: any) {
        return NextResponse.json({error: error.message}, 
        {status: 500})
    }
}