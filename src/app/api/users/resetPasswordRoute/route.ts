import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";

connect()

export async function POST(request: NextRequest){
    try{

        const reqBody = await request.json();
        const {token, newPassword, confirmPassword} = reqBody;

        const user = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: {$gt: Date.now()}
        });

        // Check if user with the token exists
        if(!user){
            return NextResponse.json({message: "Invalid or expired token"}, {status: 400})
        }

        // Check if passwords match
        if(newPassword !== confirmPassword){
            return NextResponse.json({message: "Passwords do not match"}, {status: 400})
        }

        // Min length check
        if (newPassword.length < 6 || confirmPassword.length < 6){
            return NextResponse.json({message: "Password must be at least 6 characters long"}, {status: 400})
        }

        // Max length check
        if (newPassword.length > 30 || confirmPassword.length > 30){
            return NextResponse.json({message: "Password can be no longer than 30 characters"}, {status: 400})
        }

        // Check for at least one special character
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(newPassword || !specialCharRegex.test(confirmPassword)) ){
            return NextResponse.json(
            { message: "Password must contain at least one special character" },
            { status: 400 }
    );
} 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;

        await user.save();

        return NextResponse.json({message: "Password reset successful"}, {status: 200})


    } catch(error:any){
        return NextResponse.json({error: error.message},
            {status:500})
    }
}