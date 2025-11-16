"use client";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import "./signup.css";

export default function SignUpPage() {
    const router = useRouter();
    const [user, setUser] = useState({ //Sets the user state to an object with empty email, password, and username fields
        email: "",
        password: "",
        username: ""
    })

    const [errorMessage, setErrorMessage] = useState(""); //Sets the errorMessage state to an empty string initially

    const [buttonDisabled, setButtonDisabled] = useState(false); //Sets the buttonDisabled state to false initially
    const [loading, setLoading] = useState(false); //Sets the loading state to false initially

    const onSignup = async () => {
        try {
            setLoading(true); //Sets loading state to true when signup process starts
            const response = await axios.post("/api/users/signupRoute", user); //Axios is saying to pause and wait for the response from the server after making a POST request to the signupRoute API endpoint with the user data
            router.push("/login"); //After a successful signup, navigate to the login page
        } catch (error:any) { //Typescript type annotation specifying that error can be of any type
            setErrorMessage(error.response?.data?.message || "An error occurred"); //Displays an error toast notification with the error message if signup fails
        }finally {
            setLoading(false); //Sets loading state to false when signup process ends regardless of success or failure
        }

    }

    //Checks if email, password, and username fields are not empty and enables the button accordingly and runs this effect whenever the user state changes
    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]); 

    return <div className="signup-page">
        <h1>{loading ? "Processing" : "Sign Up"}</h1>
        <hr />

        <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
            id="username"
            type="text"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder="username"
            />
        </div>

        <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="email"
            />
        </div>

        <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="password"
            />
        </div>

        {/* BUTTON WRAPPER */}
        <div className="form-group">
            <button
            onClick={onSignup}
            className="signup-button"
            disabled={buttonDisabled || loading}
            >
            {buttonDisabled ? "No signup" : "Signup"}
            </button>
        </div>

        <div className ="login-link-wrapper">
        <Link href="/login">Visit login page</Link>
    </div>

    <div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
</div>

}