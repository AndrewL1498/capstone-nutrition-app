"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // loading state

  const getUserDetails = async () => {
    try {
      const res = await axios.get("/api/users/me");
      return res.data.data.username;
    } catch (err: any) {
      console.log(err.message);
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
      console.log(error.message);
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>Profile Page</h1>
      <hr />
      <h2 className="p-1 rounded bg-green-500">
        <Link href={`/profile/${data}`}>{data}</Link>
      </h2>
      <hr />
      <button
        onClick={logout}
        className="bg-blue-500 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>

      <button
        onClick={userDetailsPage}
        className="bg-green-800 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to User Details
      </button>

      <button
        onClick={mealPlanPage}
        className="bg-green-800 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Meal Plan
      </button>
    </div>
  );
}
