"use client";
import Link from "next/link";
import React, {useEffect} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function SignUpPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({ //Sets the user state to an object with empty email, password, and username fields
        email: "",
        password: "",
        username: ""
    })

    const [buttonDisabled, setButtonDisabled] = React.useState(false); //Sets the buttonDisabled state to false initially
    const [loading, setLoading] = React.useState(false); //Sets the loading state to false initially

    const onSignup = async () => {
        try {
            setLoading(true); //Sets loading state to true when signup process starts
            const response = await axios.post("/api/users/signupRoute", user); //Axios is saying to pause and wait for the response from the server after making a POST request to the signupRoute API endpoint with the user data
            console.log("Signup success", response.data);
            router.push("/login"); //After a successful signup, navigate to the login page
        } catch (error:any) { //Typescript type annotation specifying that error can be of any type
            console.log("Signup failed", error.message);
            toast.error(error.message); //Displays an error toast notification with the error message if signup fails
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

    return <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1>{loading ? "Processing" : "Sign Up"}</h1> {/*If loading is true, show "Processing", otherwise show "Sign Up"*/}
        <hr />
        <label htmlFor="username">username</label>
        <input
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
            id="username" 
            type="text" 
            value={user.username} 
            onChange= {(e) => setUser({...user, username: e.target.value})}
            placeholder="username"
            />
        <label htmlFor="email">email</label>
        <input
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
            id="email" 
            type="email" 
            value={user.email} 
            onChange= {(e) => setUser({...user, email: e.target.value})}
            placeholder="email"
            />
        <label htmlFor="password">password</label>
        <input
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
            id="password" 
            type="password" 
            value={user.password} 
            onChange= {(e) => setUser({...user, password: e.target.value})}
            placeholder="password"
            />
            <button
            onClick={onSignup} //Calls the onSignup function when clicked
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
            >{buttonDisabled ? "No signup" : "Signup"}</button> {/* Renders a button with text based on buttonDisabled state */}
            <Link href="/login">Visit login page</Link>
        </div>
}