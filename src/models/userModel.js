import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, 
        required: [true, "Please provide a username"],
        unique: true, 
    },
    email: { 
        type: String,
        required: [true, "Please provide a email"],
        unique: true,
    },
    password: { 
        type: String,
        required: [true, "Please provide a password"] 
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
})

const User = mongoose.models.User || mongoose.model("User", userSchema); // if model already exists, use it. Otherwise, create a new model called "users".

export default User;