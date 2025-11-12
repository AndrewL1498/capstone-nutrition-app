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
  caloriesPerServing: number;
  totalCalories: number;
  servings: number;
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

  const handleGenerateMealPlan = async () => {
    try {
      if (!user) return;

      const { healthPrefs, calories, sections } = user.userDetails;
      console.log("User Details:", user.userDetails);

      const breakfastRatio = 0.25;
      const lunchRatio = 0.35;

      const breakfastMin = Math.floor(calories.min * breakfastRatio);
      const breakfastMax = Math.floor(calories.max * breakfastRatio);
      const lunchMin = Math.floor(calories.min * lunchRatio);
      const lunchMax = Math.floor(calories.max * lunchRatio);
      const dinnerMin = calories.min - breakfastMin - lunchMin;
      const dinnerMax = calories.max - breakfastMax - lunchMax;

      const response = await axios.post('/api/users/mealPlanRoute', {
        healthPrefs,
        calories,
        sections,
        breakfastMin,
        breakfastMax,
        lunchMin,
        lunchMax,
        dinnerMin,
        dinnerMax
      });

      setUser(prev => prev ? { ...prev, mealPlan: response.data.mealPlan } : prev);
      console.log('Meal plan generated:', response.data);
    } catch (err: any) {
      console.error("Failed to generate meal plan:", err);
    }
  };


  return (
  <div className="meal-plan-page">
    <h1>Meal Plan Page</h1>
    <button className="generate-button" onClick={handleGenerateMealPlan}>
      Generate Meal Plan
    </button>

    {user.mealPlan.length === 0 ? (
      <p>No meal plan generated yet.</p>
    ) : (
      user.mealPlan.map((day: MealDay, index: number) => (
        <div className="meal-day" key={index}>
          <h2>Day {index + 1}</h2>
          <div className="meals">
            {(["Breakfast", "Lunch", "Dinner"] as const).map((mealType) => {
              const meal: MealDetailsType & { error?: string } = day.sections[mealType];

              return (
                <div className="meal-card" key={mealType}>
                  <h3>{mealType}</h3>

                  {meal.error ? (
                    <p>Recipe data unavailable due to API limits</p>
                  ) : (
                    <>
                      {meal.image && <img src={meal.image} alt={meal.label} />}
                      <p className="label">{meal.label || "Recipe name unavailable"}</p>
                      <p className="details">
                        totalCalories: {meal.totalCalories ? Math.round(meal.totalCalories) : "N/A"}
                      </p>
                      <p className="details">
                        caloriesPerServing: {meal.caloriesPerServing ? Math.round(meal.caloriesPerServing) : "N/A"}
                      </p>
                      {(meal.cuisineType || []).length > 0 && (
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
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))
    )}

    {isModalOpen && selectedMeal && (
      <MealDetails meal={selectedMeal} onClose={() => setIsModalOpen(false)} />
    )}
  </div>
)}
