"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./navbar.css"; // Optional: create a separate CSS file

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="navbar">
      <button onClick={() => router.push("/profile")}>Profile</button>
      <button onClick={() => router.push("/userDetails")}>User Details</button>
      <button onClick={() => router.push("/mealPlan")}>Meal Plan</button>
    </nav>
  );
}
