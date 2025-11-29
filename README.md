# Meal Planner App

## Description
The Meal Planner App allows users to create a **custom weekly meal plan** based on their personal preferences, including dish types, allergies, calorie goals, and dietary restrictions. Once preferences are selected, users can generate a meal plan and view detailed information for each meal, such as servings, ingredients, calories per serving, and cuisine type.

## Live Demo
You can access the live app here:  
[https://capstone-nutrition-app.onrender.com](https://capstone-nutrition-app.onrender.com)

## Features
- Generate a 7-day meal plan tailored to user preferences  
- View detailed meal information: ingredients, calories, servings, and cuisine type  
- Handle dietary restrictions and allergies  
- User authentication and profile management  
- Responsive design for desktop 

## Technologies Used
- **Frontend:** Next.js, React, TypeScript, CSS  
- **Backend:** Node.js, MongoDB  
- **Testing:** Jest with TypeScript support  

## Local Setup
To run the app locally, you need to configure the following **environment variables**:

- `MONGODB_URL` – MongoDB connection string  
- `TOKEN_SECRET` – Secret for JWT authentication  
- `NODE_MAILER_USER` – Email account for sending emails  
- `NODE_MAILER_PASSWORD` – Password for the email account  
- `MEAL_PLANNER_APP_ID` & `MEAL_PLANNER_APP_KEY` – Edamam Meal Planner API credentials  

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm run dev

```

### Other notes for testing
To test this project properly, run npx jest --runInBand. If you run all tests at the same time in parallel it can cause other tests to fail. Also, the backend tests are .ts files, and the front end tests are .tsx files. Because of this, for all the tests to pass you have to have the proper preferences set in tsconfig.json file. Right now the preferences for testing are added below the current preferences and are commented out because they get overwritten when running the app. Comment the current preferences out and testing preferences in for testing, and then switch it back when you want to run the app

