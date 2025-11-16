"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "./profile.css";

export default function ProfilePage() {
  const router = useRouter();

  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // loading state

  const getUserDetails = async () => {
    try {
      const res = await axios.get("/api/users/me");
      return res.data.data.username;
    } catch (err: any) {
      toast.error("Failed to load user details");
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const username = await getUserDetails();
      if (username) setData(username);
      setLoading(false); // stop loading regardless
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const userDetailsPage = () => router.push(`/userDetails`);
  const mealPlanPage = () => router.push(`/mealPlan`);

  // Render loading screen while fetching username
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <div className="profile-divider"></div>

      <h2>Hi {data}!</h2>

      <button className="profile-btn logout" onClick={logout}>
        Logout
      </button>

      <button
        className="profile-btn primary"
        onClick={() => router.push("/userDetails")}
      >
        Meal Plan Preferences
      </button>

      <button
        className="profile-btn primary"
        onClick={() => router.push("/mealPlan")}
      >
        Go to Meal Plan
      </button>
    </div>
  );
}