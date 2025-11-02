"use client";

import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { healthLabels, allergyLabels, cuisineTypes, dishTypes, mealTypes } from "@/foodCategories/foodCategories"; 

connect(); // Establishes a connection to the database using the connect function from dbConfig

export default function UserDetailsPage() {
    const router = useRouter();

    // const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]); //State for meal types (may or may not be used)
    const [healthPrefs, setHealthPrefs] = useState<string[]>([]); //<string[]> sets the type as an array of strings
    const [calories, setCalories] = useState({ min: 1000, max: 2000 });

    type Section = { dishes: string[]; meals: string[] }; // Define the Section type
    type SectionsState = { Breakfast: Section; Lunch: Section; Dinner: Section }; // Define the SectionsState type
    
    const [sections, setSections] = useState<SectionsState>({
    Breakfast: { dishes: [], meals: ["breakfast"] },
    Lunch: { dishes: [], meals: ["lunch"] },
    Dinner: { dishes: [], meals: ["dinner"] },
});


    // percentages for each meal
    const breakfastRatio = 0.25;
    const lunchRatio = 0.35;
    const dinnerRatio = 0.40;

    const breakfastMin = Math.floor(calories.min * breakfastRatio);
    const breakfastMax = Math.floor(calories.max * breakfastRatio);

    const lunchMin = Math.floor(calories.min * lunchRatio);
    const lunchMax = Math.floor(calories.max * lunchRatio);

    const dinnerMin = calories.min - breakfastMin - lunchMin;
    const dinnerMax = calories.max - breakfastMax - lunchMax;

//    const handleClickMealTypes = (label: string) => {
//     if (healthPrefs.includes(label)) {
//       setSelectedMealTypes(prev => prev.filter(item => item !== label));
//     } else {
//       setSelectedMealTypes(prev => [...prev, label]);
//     }
//   };

   const handleClickDiets = (label: string) => {
    if (healthPrefs.includes(label)) {
      setHealthPrefs(prev => prev.filter(item => item !== label)); //prev stands for previous state. This filters out any item that matches the label and creates a new array without it
    } else {
      setHealthPrefs(prev => [...prev, label]); //...prev spreads the previous array items into the new array and adds the new label
    }
  };

   const handleClickAllergies = (label: string) => {
    if (healthPrefs.includes(label)) {
      setHealthPrefs(prev => prev.filter(item => item !== label));
    } else {
      setHealthPrefs(prev => [...prev, label]); 
    }
  };

const handleClickDishTypesBreakfast = (label: string) => {
  setSections(prev => ({
    ...prev, // copy the outer object
    Breakfast: {
      ...prev.Breakfast, // copy the Breakfast section
      dishes: prev.Breakfast.dishes.includes(label)
        ? prev.Breakfast.dishes.filter(item => item !== label) // remove if exists
        : [...prev.Breakfast.dishes, label] // add if not
    }
  }));
};

const handleClickDishTypesLunch = (label: string) => {
  setSections(prev => ({
    ...prev, // copy the outer object
    Lunch: {
      ...prev.Lunch, // copy the Lunch section
      dishes: prev.Lunch.dishes.includes(label)
        ? prev.Lunch.dishes.filter(item => item !== label) // remove if exists
        : [...prev.Lunch.dishes, label] // add if not
    }
  }));
};

const handleClickDishTypesDinner = (label: string) => {
  setSections(prev => ({
    ...prev, // copy the outer object
    Dinner: {
      ...prev.Dinner, // copy the Dinner section
      dishes: prev.Dinner.dishes.includes(label)
        ? prev.Dinner.dishes.filter(item => item !== label) // remove if exists
        : [...prev.Dinner.dishes, label] // add if not
    }
  }));
};

  console.log("Selected Health Preferences:", healthPrefs);
  console.log("Selected Meal Preferences", sections);
  console.log("Calorie Range:", calories);


    const handleGenerateMealPlan = async () => {
      try {
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
        console.log('Meal plan generated:', response.data);
      } catch (error:any) {
        console.error('Error generating meal plan:', error.response?.data || error.message);
      }
            
    }
;

    return (
        <div>
            <h1>User Details Page</h1>
            {/* <h2>Meal per day</h2>
            {mealTypes.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickMealTypes(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: selectedMealTypes.includes(label) ? "green" : "purple", }}
            >
                {label}
            </button>
            )} */}
            <h2>Diets</h2>
            {healthLabels.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickDiets(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: healthPrefs.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            {cuisineTypes.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickDiets(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: healthPrefs.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            <h2>Allergies</h2>
            {allergyLabels.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickAllergies(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: healthPrefs.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            <h2>Calories</h2>
            <h3>Min</h3>
            <input
              type="number"
              placeholder="Enter calories"
              value={calories.min} // or calories.max depending on which input
              style={{ backgroundColor: "#f0f0f0", color: "#000000", padding: "2px", borderRadius: "4px" }}
              onChange={(e) => setCalories(prev => ({
                ...prev,
                min: Number(e.target.value)
              }))}
            />
            <h3>Max</h3>
            <input
              type="number"
              placeholder="Enter calories"
              value={calories.max} // or calories.max depending on which input
              style={{ backgroundColor: "#f0f0f0", color: "#000000", padding: "2px", borderRadius: "4px" }}
              onChange={(e) => setCalories(prev => ({
                ...prev,
                max: Number(e.target.value)
              }))}
            />
            <h2>Breakfast</h2>
            {dishTypes.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickDishTypesBreakfast(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: sections.Breakfast.dishes.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            <h2>Lunch</h2>
            {dishTypes.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickDishTypesLunch(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: sections.Lunch.dishes.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            <h2>Dinner</h2>
            {dishTypes.map((label, index) =>
            <button
                key={index}
                onClick={() => handleClickDishTypesDinner(label)}
                style ={{ margin: "4px", padding: "8px", backgroundColor: sections.Dinner.dishes.includes(label) ? "green" : "purple" }}
            >
                {label}
            </button>
            )}
            <br></br>
            <button onClick={handleGenerateMealPlan}>Generate Meal Plan</button>
        </div>
    );

}

