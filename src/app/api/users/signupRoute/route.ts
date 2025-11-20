import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer"


export async function POST(request: NextRequest) {
    try {
        await connect() //Establishes a connection to the database using the connect function from dbConfig
        const reqBody = await request.json() //parses the incoming request body as JSON by calling request.text and then json.parse under the hood
        const {username, email, password} = reqBody //destructures the incoming request body to extract username, email, and password

        const normalizedEmail = email.toLowerCase(); //converts email to lowercase

        // Check if user already exists in the user model
        const user = await User.findOne({ email: normalizedEmail })

        if (user) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }
        
        // Min length check
        if (password.length < 6){
            return NextResponse.json({message: "Password must be at least 6 characters long"}, {status: 400})
        }

        // Max length check
        if (password.length > 30){
            return NextResponse.json({message: "Password can be no longer than 30 characters"}, {status: 400})
        }

        // Check for at least one special character
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password) ){
            return NextResponse.json(
            { message: "Password must contain at least one special character" },
            { status: 400 }
    );
} 

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const newUser = new User({
            username,
            email: normalizedEmail,
            password: hashedPassword
        })

        const savedUser = await newUser.save()

        //send verfication email
        await sendEmail({email, emailType: "VERIFY",
            userId: savedUser._id
        })

        return NextResponse.json({ 
            message: "User created successfully", 
            success: true,
            savedUser 
        })

    } catch (error: any) {
        return NextResponse.json({error: error.message}, 
        {status: 500})
    }
}