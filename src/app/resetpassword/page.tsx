"use client"

import React, {useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "./resetPassword.css";

export default function ResetPasswordPage() {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "");
    }, []);

    const resetPassword = async() => {
    
        try{
            const response = await axios.post("/api/users/resetPasswordRoute", {token, newPassword, confirmPassword});
            toast.success(response.data.message);
            router.push("/login");
        } catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred"); 
        }
    }

     return (
        <div className="reset-password-page">
            <h1>Reset Password</h1>
            <form onSubmit={(e) => { e.preventDefault(); resetPassword(); }}>
                <input
                    className="reset-input"
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                />
                <input
                    className="reset-input"
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                />
                <button 
                    type="submit"
                    className="reset-button"
                    disabled={!newPassword || !confirmPassword}
                >
                    Change Password
                </button>
            </form>
        </div>
    )
}