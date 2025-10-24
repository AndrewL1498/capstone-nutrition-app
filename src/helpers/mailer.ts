const nodemailer = require("nodemailer");
import User from '@/models/userModel';
import bcryptjs from 'bcryptjs';

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
        // create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        await User.findByIdAndUpdate(userId, {resetPasswordToken: hashedToken, resetPasswordExpires: Date.now() + 3600000})

    } catch (error:any) {

    }
}