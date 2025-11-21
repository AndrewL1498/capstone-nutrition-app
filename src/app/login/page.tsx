"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => { // form submission creates an event. React.FormEvent<HTMLFormElement> ensures correct typing for TypeScript
    if (event) event.preventDefault(); // prevent default form submission which is a page reload
    try {
      setLoading(true);
      const response = await axios.post("/api/users/loginRoute", user);
      toast.success("Login successful");
      router.push("/profile");
    } catch (error: any) {

        const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message

        toast.error(serverMessage);

    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setButtonDisabled(!(user.email.length > 0 && user.password.length > 0));
  }, [user]);

  return (
    <div className="login-page">
      <h1>{loading ? "Processing" : "Login"}</h1>
      <form onSubmit={onLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="login-input"
          placeholder="email"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="login-input"
          placeholder="password"
        />
        <button
          type="submit" // triggers onLogin on Enter
          disabled={buttonDisabled || loading} // disable when loading or inputs empty
          className="login-button"
        >
          Login here
        </button>
      </form>

      <button
        onClick={() => router.push("/forgotpassword")}
        className ="forgot-password-link"
      >
        Forgot Password
      </button>
      <Link href="/signup"
      className="login-link">Visit signup page</Link>
    </div>
  );
}
