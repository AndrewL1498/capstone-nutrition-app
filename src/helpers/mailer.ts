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

            const route = emailType === "VERIFY" ? "verifyemail" : "resetpassword";

            const transporter = nodemailer.createTransport({ //create transport creates a transporter object that connects to an email service
             host: "sandbox.smtp.mailtrap.io", //What mail service to connect to
             port: 2525, //mailtrap uses port 2525 for it's sandbox
             auth: { //login credentials for mailtrap account
             user: process.env.NODE_MAILER_USER,
             pass: process.env.NODE_MAILER_PASS
        }});

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href=${process.env.DOMAIN}/${route}?token=${hashedToken}>here</a> 
            to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}.
            <br><br>
            Or copy and paste the link below in your browser.
            ${process.env.DOMAIN}/${route}?token=${hashedToken}
            </p>`
        }

        const mailResponse = await transporter.sendMail(mailOptions); //transporter.sendMail is an async function provided by Nodemailer that connect to the SMTP server and passes along the mailOptions data
        return mailResponse;

    } catch (error:any) {
        throw new Error(error.message);
        
    }
}