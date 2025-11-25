///Run "npx jest --runInBand" or else "login successful" and "invalid password" tests (and maybe even other tests) will sometimes fail


import dotenv from 'dotenv';
import { POST as mealPlanHandler } from "@/app/api/users/mealPlanRoute/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
beforeAll(async () => {
    await connect();
    global.fetch = jest.fn();
});

let mockMealPlanBody: any; //a rusable variable that can be used across all tests
let dbUser: any

const fakeRecipe = (label: string, calories: number) => ({
    ok: true,
    json: async () => ({
        recipe: {
            label,
            image: `http://image.com/${label.toLowerCase()}.jpg`,
            url: `http://recipe.com/${label.toLowerCase()}`,
            calories,
            yield: 1,
            totalNutrients: {},
            ingredientLines: ["placeholder"],
            cuisineType: ["American"],
        },
    }),
});

beforeEach(async () => {
    // Reset users
    await mongoose.connection.collection("users").deleteMany({});

    //Creates new user in the database
        dbUser = await User.create({
        username: "Andrewthree",
        email: "andrewthree@test.com",
        password: await bcrypt.hash("Password123!", 10),
    });

    // Store reusable body (same for every test)
    mockMealPlanBody = {
        healthPrefs: ["alcohol-free"],
        calories: { min: 1000, max: 2000 },
        sections: {
            Breakfast: { dishes: ["biscuits and cookies"], meals: ["breakfast"] },
            Lunch: { dishes: ["biscuits and cookies"], meals: ["lunch/dinner"] },
            Dinner: { dishes: ["biscuits and cookies"], meals: ["lunch/dinner"] },
        },
        breakfastMin: 300,
        breakfastMax: 500,
        lunchMin: 400,
        lunchMax: 700,
        dinnerMin: 500,
        dinnerMax: 800,
    };

    // Reset fetch each test
    (global.fetch as jest.Mock).mockReset();

    // 1️⃣ Meal planner API. When you call global.fetch as jest.Mock, you overwrite the global fetch function, meaning anytime fetch is called in the route, it gets overwritten by the mock fetch calls. The order of mocked fetch calls must match the order the fetch calls are made in the route
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ //this is like calling "const plannerData = await mealPlannerResponse.json();" in my route. .json is an async function that reads the response body sent by the API and parses it into a javascript object
            status: "OK",
            selection: [
                {
                    sections: {
                        Breakfast: { assigned: "http://fake.recipe#recipe_1" },
                        Lunch: { assigned: "http://fake.recipe#recipe_2" },
                        Dinner: { assigned: "http://fake.recipe#recipe_3" },
                    },
                },
            ],
        }),
    });

    //Calling fakeRecipe multiple times here creates 3 different fakeRecipes in memory. If I choose to access them later, I need to store them each in their own variable
    // 2️⃣ Recipe details: Breakfast
    (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Breakfast", 300));

    // 3️⃣ Recipe details: Lunch
    (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Lunch", 500));

    // 4️⃣ Recipe details: Dinner
    (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Dinner", 600));

});


afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({}); //I have a deleteMany here as well as the beforeEach so that way when all the tests are done the database gets cleared and doesn't leave anything behind the next time the tests are run
    await mongoose.connection.close();

    jest.restoreAllMocks();
})

function mockAuthRequest(body: any, userId: string) {
    const token = jwt.sign({ id: userId }, process.env.TOKEN_SECRET!, {
        expiresIn: "1h"
    });

    const req = new NextRequest("http://localhost/api/mealPlanRoute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    // Patch req.cookies (NextRequest strips cookie header inside tests)
    req.cookies.set("token", token);

    return req;
}

describe("Authorization/Authentication tests", () =>{
    test("valid token allows request", async () => {
    
        const req = mockAuthRequest(mockMealPlanBody, dbUser!._id.toString());

        const res = await mealPlanHandler(req);

        const data = await res.json();

            // 7️⃣ Assertions
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.mealPlan).toBeDefined();
        expect(data.mealPlan.length).toBe(1); // one day returned. If I test multiple days in the future, I'll have to expand my mocks accordingly

        // 8️⃣ Optional: verify DB update
        const updatedUser = await User.findById(dbUser!._id); // exclamation point is assuring typscript that dbUser exists
        expect(updatedUser?.mealPlan).toBeDefined();
        expect(updatedUser?.mealPlan.length).toBe(1);

        });
        
    test("Missing token", async () => {

        const req = new NextRequest("http://localhost/api/mealPlanRoute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mockMealPlanBody),
        });

        const res = await mealPlanHandler(req);

        const data = await res.json();
        console.log("data message:", data.message);

            // 7️⃣ Assertions
        expect(res.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.message).toMatch("token error");
        });

    test("Invalid/Expired token", async () => {

        function mockAuthRequestExpiredToken(body: any, userId: string) {
            const token = jwt.sign({ id: userId }, process.env.TOKEN_SECRET!, {
                expiresIn: "1ms"
            });

        const req = new NextRequest("http://localhost/api/mealPlanRoute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        // Patch req.cookies (NextRequest strips cookie header inside tests)
        req.cookies.set("token", token);

        return req;
};

        const req = mockAuthRequestExpiredToken(mockMealPlanBody, dbUser!._id.toString())

        const res = await mealPlanHandler(req);

        const data = await res.json();
        console.log("data message:", data.message);

            // 7️⃣ Assertions
        expect(res.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.message).toMatch("token error");
        });


describe("Input validation tests", () => {
    test("Missing fields in the body should return an error", async () =>{

        const body = {
        healthPrefs: ["alcohol-free"],
        calories: { min: 1000, max: 2000 },
        sections: {
            Breakfast: { dishes: [], meals: ["breakfast"] },
            Lunch: { dishes: [], meals: ["lunch/dinner"] },
            Dinner: { dishes: [], meals: ["lunch/dinner"] },
        },
        breakfastMin: 300,
        breakfastMax: 500,
        lunchMin: 400,
        lunchMax: 700,
        dinnerMin: 500,
        dinnerMax: 800,
    };

       const req = mockAuthRequest(body, dbUser._id.toString());

       const res = await mealPlanHandler(req);
       console.log("response:", res)

       const data = await res.json();

       expect(res.status).toBe(502);
       expect(data.success).toBe(false);
       expect(data.message).toBe("Api error occurred while fetching meal plan.")

    });
});


});

////Tests////
// 1️⃣ Authentication / Authorization Tests

// Valid token allows request → POST returns success: true and updates the meal plan for the correct user.

// Invalid token / no token → POST returns an error (401 or similar).

// Expired token → POST should fail appropriately.

// 2️⃣ Input Validation Tests

// Since your route expects specific fields in the body (healthPrefs, calories, sections, breakfastMin/max, etc.), test:

// Missing required fields → If any of the required body properties are missing, the route should handle gracefully (either defaults or error).

// Invalid types → e.g., calories are not numbers, or sections are malformed → should fail gracefully.

// Empty arrays for preferences → Ensure API handles empty healthPrefs or sections.

// 3️⃣ External API Interaction

// Since you call the Edamam Meal Planner API and then the Recipe API:

// Meal Planner API succeeds → Returns a valid meal plan.

// Meal Planner API fails → Simulate HTTP error, bad response → route returns success: false with message "Api error occurred while fetching meal plan.".

// No matching recipes → Simulate Edamam returning status !== "OK" → should return "No matching recipes found for your preferences...".

// Recipe API fails / usage limit exceeded → For one or more recipes → your route should still return the plan with error flags in the relevant meals.

// Here you would mock fetch to simulate all these scenarios.

// 4️⃣ Database Interaction Tests

// Meal plan saved correctly → After POST, the User document is updated with mealPlan, mealPlanStatus, and mealPlanGeneratedAt.

// User not found → If userId decoded from token doesn’t exist → route should return an error.

// 5️⃣ Edge Cases / Optional Behavior

// Partial recipe info → Recipe API returns some fields missing → your route still populates what’s available.

// Zero meals returned for a day → Ensure enhancedMealPlan is still an array of days (maybe with empty sections).

// Calories or sections set to 0 → Route still calculates without crashing.

// 6️⃣ Happy Path

// Full request with all inputs valid → returns success: true and correctly structured meal plan.

// Frontend expected format → Each day has sections with Breakfast, Lunch, Dinner, each with assigned, label, image, url, totalCalories, caloriesPerServing, ingredients, nutrients, etc.