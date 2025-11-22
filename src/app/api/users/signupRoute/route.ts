import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer"

connect(); //Establishes a connection to the database using the connect function from dbConfig

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json() //parses the incoming request body as JSON by calling request.text and then json.parse under the hood
        const {username, email, password} = reqBody //destructures the incoming request body to extract username, email, and password

        const normalizedEmail = email.trim().toLowerCase(); //converts email to lowercase and removes spaces

        // Check if user already exists in the user model
        const user = await User.findOne({ email: normalizedEmail });


        /////Username requirments/////
        if (user) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        if (username.length === 0) {
            return NextResponse.json({ message: "User must have a username" }, { status: 400 })
        }
        if (username.length < 2) {
            return NextResponse.json({ message: "Username must be at least 2 characters long" }, { status: 400 })
        }

        if (username.length > 20) {
            return NextResponse.json({ message: "Username must be less than 20 characters" }, { status: 400 })
        }



        /////Email requirments/////
        if (normalizedEmail.length === 0) {
            return NextResponse.json({ message: "User must have an email" }, { status: 400 })
        };

        if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
            return NextResponse.json({ message: "Invalid email address"}, { status: 400 });
        }

        if (normalizedEmail.length < 6 || normalizedEmail.length > 254 ) { // We do 254 because the maximum length for an email address according to RFC 5321 is 254 characters.
            return NextResponse.json({ message: "Email address must be greater than 5 and less than 254 characters"}, { status: 400 });
        }



        /////Password requirments/////
        if (password.length < 6){
            return NextResponse.json({message: "Password must be at least 6 characters long"}, {status: 400})
        }

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

        //send verfication email (I hit email limits for the month so this is commented out so I don't fail tests)
        // await sendEmail({email, emailType: "VERIFY",
        //     userId: savedUser._id
        // })

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