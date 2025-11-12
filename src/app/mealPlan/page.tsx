"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import MealDetails from "../Components/MealDetails"; // Make sure this path is correct
import "./mealPlan.css"; // Your existing CSS

// Interfaces
interface MealDetailsType {
  assigned: string;
  label: string;
  image?: string;
  url?: string;
  calories: number;
  cuisineType: string[];
  ingredients?: string[];
  nutrients?: Record<string, { quantity: number; unit: string }>;
}

interface MealDay {
  sections: {
    Breakfast: MealDetailsType;
    Lunch: MealDetailsType;
    Dinner: MealDetailsType;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<MealDetailsType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users/me");
        setUser(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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
              {(["Breakfast", "Lunch", "Dinner"] as const).map((mealType) => {
                const meal: MealDetailsType = day.sections[mealType];
                return (
                  <div className="meal-card" key={mealType}>
                    <h3>{mealType}</h3>
                    {meal.image && <img src={meal.image} alt={meal.label} />}
                    <p className="label">{meal.label}</p>
                    <p className="details">Calories: {Math.round(meal.calories)}</p>
                    {meal.cuisineType.length > 0 && (
                      <p className="cuisine-type">{meal.cuisineType.join(", ")}</p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMeal(meal);
                        setIsModalOpen(true);
                      }}
                    >
                      View Recipe
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {isModalOpen && selectedMeal && (
        <MealDetails
          meal={selectedMeal}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
