"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./mealPlan.css"; // Your separate CSS file for styling

// Interfaces
interface MealDetails {
  assigned: string;
  label: string;
  image: string;
  url: string;
  calories: number;
  cuisineType: string[];
}

interface MealDay {
  sections: {
    Breakfast: MealDetails;
    Lunch: MealDetails;
    Dinner: MealDetails;
  };
}

interface UserSections {
  Breakfast: { dishes: string[]; meals: string[] };
  Lunch: { dishes: string[]; meals: string[] };
  Dinner: { dishes: string[]; meals: string[] };
}

interface UserDetails {
  healthPrefs: string[];
  calories: { min: number; max: number };
  sections: UserSections;
}

interface User {
  _id: string;
  username: string;
  email: string;
  userDetails: UserDetails;
  mealPlan: MealDay[];
  mealPlanStatus: string;
  mealPlanGeneratedAt?: string;
}

export default function MealPlanPage() {
  const [user, setUser] = useState<User | null>(null); // State to hold user data set to null initially upon load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users/me");
        setUser(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to fetch user"); //Only try to access response data if error is defined and only access data if response is defined
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  console.log("User Data:", user);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>No user data found.</p>;

  return (
    <div className="meal-plan-page">
      <h1>Meal Plan Page</h1>
      {user.mealPlan.length === 0 ? (
        <p>No meal plan generated yet.</p>
      ) : (
        user.mealPlan.map((day: MealDay, index: number) => (
          <div className="meal-day" key={index}>
            <h2>Day {index + 1}</h2>
            <div className="meals">
              {["Breakfast", "Lunch", "Dinner"].map((mealType) => {
                const meal: MealDetails = day.sections[mealType as keyof typeof day.sections];
                return (
                  <div className="meal-card" key={mealType}>
                    <h3>{mealType}</h3>
                    {meal.image && <img src={meal.image} alt={meal.label} />}
                    <p className="label">{meal.label}</p>
                    <p className="details">Calories: {Math.round(meal.calories)}</p>
                    {meal.cuisineType.length > 0 && (
                      <p className="cuisine-type">{meal.cuisineType.join(", ")}</p>
                    )}
                    {meal.url && (
                      <a href={meal.url} target="_blank" rel="noopener noreferrer">
                        View Recipe
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}