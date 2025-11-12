// components/MealDetails.tsx
"use client";
import React from "react";
import "./mealDetails.css"; // separate CSS for modal styling

interface MealDetailsProps {
  meal: {
    label: string;
    image?: string;
    calories: number;
    cuisineType?: string[];
    ingredients?: string[];
    nutrients?: Record<string, { quantity: number; unit: string }>;
    url?: string;
  };
  onClose: () => void;
}

export default function MealDetails({ meal, onClose }: MealDetailsProps) { //destructure meal and onClose from MealDetailsProps. The ": MealDetailsProps" defines the shape of the props object.      
  if (!meal) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* stopPropagation prevents closing when clicking inside modal because clicking inside should not close the modal */}
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{meal.label}</h2>
        {meal.image && <img src={meal.image} alt={meal.label} />}
        <p>Calories: {Math.round(meal.calories)}</p>
        {meal.cuisineType && meal.cuisineType.length > 0 && (
          <p>Cuisine: {meal.cuisineType.join(", ")}</p>
        )}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div>
            <h3>Ingredients:</h3>
            <ul>
              {meal.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
        )}
        {meal.nutrients && (
          <div>
            <h3>Nutrients:</h3>
            <ul>
              {Object.entries(meal.nutrients).map(([key, value]: any) => (
                <li key={key}>
                  {key}: {value.quantity.toFixed(2)} {value.unit} {/* toFixed ensures two decimal places for better readability */}
                </li>
              ))}
            </ul>
          </div>
        )}
        {meal.url && (
          <a href={meal.url} target="_blank" rel="noopener noreferrer">
            View Full Recipe Online
          </a>
        )}
      </div>
    </div>
  );
}
