///Run "npx jest --runInBand" or else "login successful" and "invalid password" tests (and maybe even other tests) will sometimes fail


import dotenv from 'dotenv';
dotenv.config();

import { POST as mealPlanHandler } from "@/app/api/users/mealPlanRoute/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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


describe("Edamam successes and errors", () => {
    test("Edamam successfully returns a meal plan with details", async () => {

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());

        const res = await mealPlanHandler(req);
        const data = await res.json();
        const updatedUser = await User.findOne({email: "andrewthree@test.com"});

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(updatedUser.userDetails).toBeDefined();
        expect(updatedUser.userDetails.sections.Breakfast.dishes.length).toBeGreaterThan(0);

    });

    test("Edamam rejects api request", async () => {
        // Reset fetch
        (global.fetch as jest.Mock).mockReset();

        // Mocks Edamam api call error
        (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            status: "error",
            message: "No matching recipes found"
        }),
        });

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());

        const res = await mealPlanHandler(req);
        const data = await res.json();

        expect(res.status).toBe(502);
        expect(data).toEqual({success: false, message: "Api error occurred while fetching meal plan."});
  });
  
    test("Edamam returns 200 but status is not OK", async () => {
        // Reset fetch
        (global.fetch as jest.Mock).mockReset();

        // Mocks Edamam api call error
        (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            status: "error",
            message: "No matching recipes found"
        }),
        });

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());

        const res = await mealPlanHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({success: false, message: "No matching recipes found for your preferences. Please try again."});
  });

    test("Edamam returns an error if preferences are invalid, such as extreme calorie counts", async () => {
        // Reset fetch
        (global.fetch as jest.Mock).mockReset();

        // Mocks Edamam api call error
        (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            status: "error",
            message: "No matching recipes found for your preferences. Please try again."
          }),
        });

          const extremeMealPlanBody = {
            ...mockMealPlanBody,
          calories: { min: 100000, max: 200000 }, // obviously unrealistic
  };

        const req = mockAuthRequest(extremeMealPlanBody, dbUser._id.toString());

        const res = await mealPlanHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({success: false, message: "No matching recipes found for your preferences. Please try again."});
  });

    test("Handles 7 days in Edamam selection", async () => {
        // Reset fetch
        (global.fetch as jest.Mock).mockReset();

        // Mock Meal Planner API to return 7 days
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                status: "OK",
                selection: [
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_1" }, Lunch: { assigned: "http://fake.recipe#recipe_2" }, Dinner: { assigned: "http://fake.recipe#recipe_3" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_4" }, Lunch: { assigned: "http://fake.recipe#recipe_5" }, Dinner: { assigned: "http://fake.recipe#recipe_6" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_7" }, Lunch: { assigned: "http://fake.recipe#recipe_8" }, Dinner: { assigned: "http://fake.recipe#recipe_9" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_10" }, Lunch: { assigned: "http://fake.recipe#recipe_11" }, Dinner: { assigned: "http://fake.recipe#recipe_12" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_13" }, Lunch: { assigned: "http://fake.recipe#recipe_14" }, Dinner: { assigned: "http://fake.recipe#recipe_15" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_16" }, Lunch: { assigned: "http://fake.recipe#recipe_17" }, Dinner: { assigned: "http://fake.recipe#recipe_18" } } },
                    { sections: { Breakfast: { assigned: "http://fake.recipe#recipe_19" }, Lunch: { assigned: "http://fake.recipe#recipe_20" }, Dinner: { assigned: "http://fake.recipe#recipe_21" } } },
                ],
            }),
        });

        // Mock recipe details for all 21 recipes. Each mocked fetch after the first one will always hit the 2nd fetch request
        for (let i = 1; i <= 21; i++) {
            (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe(`Recipe${i}`, 500)); // calling fakeRecipe function and passing Recipe1, Recipe2, etc. with 500 calories each
        }

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());
        const res = await mealPlanHandler(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);

        // Assert 7 days returned
        expect(data.mealPlan.length).toBe(7);

        // Assert each day has Breakfast/Lunch/Dinner sections
        data.mealPlan.forEach((day: { sections: { Breakfast: any; Lunch: any; Dinner: any } }) => {
            expect(day.sections.Breakfast).toBeDefined();
            expect(day.sections.Lunch).toBeDefined();
            expect(day.sections.Dinner).toBeDefined();
        });
    });
});


describe("Recipe details API tests", () => {
    test("handles missing recipe data without crashing", async () => {
          // 1️⃣ Reset global fetch mock
        (global.fetch as jest.Mock).mockReset();

        // 2️⃣ Mock Meal Planner API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
            status: "OK",
            selection: [
                {
                sections: {
                    Breakfast: { assigned: "http://fake.recipe#recipe_missing" },
                    Lunch: { assigned: "http://fake.recipe#recipe_missing" },
                    Dinner: { assigned: "http://fake.recipe#recipe_missing" },
                },
                },
            ],
            }),
        });

        // 3️⃣ Mock Recipe API response to return missing data
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
            // Intentionally missing the `recipe` field
            }),
        });

        // 4️⃣ Make the request
        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());
        const res = await mealPlanHandler(req);
        const data = await res.json();

        // 5️⃣ Assertions
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);

        // Each meal should still have an 'assigned' field, but no other recipe data
        const enhanced = data.mealPlan[0].sections; // ensures we access day 1
        expect(enhanced.Breakfast.assigned).toBe("http://fake.recipe#recipe_missing");
        expect(enhanced.Lunch.assigned).toBe("http://fake.recipe#recipe_missing");
        expect(enhanced.Dinner.assigned).toBe("http://fake.recipe#recipe_missing");

        // Optional: Check that other fields are not set
        expect(enhanced.Breakfast.label).toBeUndefined();
        expect(enhanced.Lunch.label).toBeUndefined();
        expect(enhanced.Dinner.label).toBeUndefined();
    });

    test("Handles recipe API usage limit errors", async () => {
        // Reset fetch
        (global.fetch as jest.Mock).mockReset();

        // 1️⃣ Mock Meal Planner API to return OK with assigned recipes
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
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

        // 2️⃣ Mock Recipe API fetches:
        // Breakfast succeeds
        (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Breakfast", 300));
        // Lunch throws an error to simulate usage limit
        (global.fetch as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Usage limit reached");
        });
        // Dinner succeeds
        (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Dinner", 600));

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());
        const res = await mealPlanHandler(req);
        const data = await res.json();

        // 1️⃣ Response is successful
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);

        // 2️⃣ Extract first day
        const sections = data.mealPlan[0].sections;

        // 3️⃣ Check that the Lunch meal has the 'Usage Limits Exceeded' field
        expect(sections.Breakfast.error).toBeUndefined();
        expect(sections.Lunch.error).toBe("Usage Limits Exceeded");
        expect(sections.Dinner.error).toBeUndefined();
        });


    test("Database integrity after generating meal plan", async () => {
        // Save original user fields
        const originalUser = await User.findById(dbUser._id);
        const originalUsername = originalUser?.username;
        const originalEmail = originalUser?.email;

        // Mock single day for simplicity
        (global.fetch as jest.Mock).mockReset();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                status: "OK",
                selection: [
                    { sections: 
                        { 
                        Breakfast: { assigned: "http://fake.recipe#recipe_1" }, 
                        Lunch: { assigned: "http://fake.recipe#recipe_2" }, 
                        Dinner: { assigned: "http://fake.recipe#recipe_3" } } },
                ],
            }),
        });

        //mocks the recipe fetch 3 times
        (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Breakfast", 300));
        (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Lunch", 500));
        (global.fetch as jest.Mock).mockResolvedValueOnce(fakeRecipe("Dinner", 600));

        const req = mockAuthRequest(mockMealPlanBody, dbUser._id.toString());
        const res = await mealPlanHandler(req);
        const updatedUser = await User.findById(dbUser._id);

        expect(res.status).toBe(200);

        // Other fields should remain unchanged
        expect(updatedUser?.username).toBe(originalUsername);
        expect(updatedUser?.email).toBe(originalEmail);

        // mealPlanGeneratedAt should be updated (exists and is a date)
        expect(updatedUser?.mealPlanGeneratedAt).toBeDefined();
        expect(updatedUser?.mealPlanGeneratedAt).toBeInstanceOf(Date);

        // Meal plan length should match returned selection
        expect(updatedUser?.mealPlan.length).toBe(1);
    });



    });
});