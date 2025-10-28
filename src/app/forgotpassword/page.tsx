"use client"

import React, {useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";

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

 }


    return (
    <div>
        <h1>Forgot password</h1>
                <input
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
            id="email" 
            type="text" 
            value = {email}
            onChange= {(e) => setEmail(e.target.value)}
            placeholder="email"
            />
            <button onClick={findEmail}>Reset Password</button>
            {userMessage && <p className="text-green-600">{userMessage}</p>}

    </div>
    )

};
