"use client"

import React, {useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const [userMessage, setUserMessage] = useState("");

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "");
    }, []);

    const resetPassword = async() => {
    
        try{
            const response = await axios.post("/api/users/resetPasswordRoute", {token, newPassword, confirmPassword});
            setUserMessage(response.data.message); 
        } catch(error:any){
            setUserMessage(error.response?.data?.message || "An error occurred"); 
        }
    }

    return (
        <div>
            <h1>Reset Password Page</h1>
            <input
                className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
                id="new-password" 
                type="password" 
                value = {newPassword}
                onChange= {(e) => setNewPassword(e.target.value)}
                placeholder="New password"
            />
            <input
                className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
                id="confirm-password" 
                type="password" 
                value = {confirmPassword}
                onChange= {(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
            />
            <button onClick={resetPassword}>Change Password</button>
            {userMessage && <p className="text-green-600">{userMessage}</p>}
        </div>
    )
}