const nodemailer = require("nodemailer");
import User from '@/models/userModel';
import bcryptjs from 'bcryptjs';

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
        // create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        // find the user by id and update the verify token fields in the database
        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
            {verifyToken: hashedToken,
             verifyTokenExpiry: Date.now() + 3600000})
            
            } else if (emailType === "RESET") {
                await User.findByIdAndUpdate(userId,
            {forgotPasswordToken: hashedToken,
             forgotPasswordTokenExpiry: Date.now() + 3600000})
            }

            const transporter = nodemailer.createTransport({
                // Looking to send emails in production? Check out our Email API/SMTP product!
             host: "sandbox.smtp.mailtrap.io",
             port: 2525,
             auth: {
             user: process.env.NODE_MAILER_USER,
             pass: process.env.NODE_MAILER_PASS
        }});

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href=${process.env.DOMAIN}/
            verifyemail?token=${hashedToken}>here</a> to 
            ${emailType === "VERIFY" ? "verify your email" : "reset your password"}</p>`
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse;

    } catch (error:any) {
        throw new Error(error.message);
    }
}