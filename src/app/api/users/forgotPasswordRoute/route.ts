import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
// import dotenv from "dotenv";
import { sendEmail } from "@/helpers/mailer"

// dotenv.config();
 

connect()


export async function POST(request: NextRequest){
    try{
        const reqBody = await request.json();
        const {email} = reqBody;
        const user = await User.findOne({email});

        if (!user){
            return NextResponse.json({message: "If an account with this email exists, a reset link has been sent"}, {status: 200})
        }

        //send verfication email
        await sendEmail({email, emailType: "RESET",
            userId: user._id
        })

        return NextResponse.json(
        { message: "Reset email sent" },
        { status: 200 }
);


    } catch(error:any){
        return NextResponse.json({error: error.message},
            {status:500})
    }
}