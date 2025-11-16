"use client"

import React, {useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./forgotPassword.css";

export default function forgotPassword() {

 const [email, setEmail] = useState("");
 const [userMessage, setUserMessage] = useState("");

 const findEmail = async() => {
    try{
      const response = await axios.post("/api/users/forgotPasswordRoute", {email});
      setUserMessage(response.data.message); 
    } catch(error:any){
        toast.error(error.message);
    }
 };


    return (
    <div className ="forgot-password-page">
        <h1>Forgot password</h1>
                <input
            className="forgot-password-input"
            id="email" 
            type="text" 
            value = {email}
            onChange= {(e) => setEmail(e.target.value)}
            placeholder="email"
            />
            <button 
                onClick={findEmail}
                className="forgot-password-button"
            >
                Reset Password</button>
                {userMessage && <p className="forgot-password-message">{userMessage}</p>}
    </div>
    )

};
