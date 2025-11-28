/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import MealPlanPage from "@/app/mealPlan/page";
import axios from "axios";
import '@testing-library/jest-dom';

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock MealDetails modal to simplify testing
jest.mock("@/app/Components/MealDetails", () => ({
  __esModule: true, // esModule is for components that use export default
  default: ({ meal, onClose }: any) => (
    <div data-testid="meal-details">
      <p>{meal.label}</p>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock Navbar
jest.mock("@/app/Components/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar" />,
}));

describe("MealPlanPage", () => {
  const mockUser = { // simplified user object
    _id: "1",
    username: "testuser",
    email: "test@test.com",
    userDetails: {
      healthPrefs: ["vegan"],
      calories: { min: 1500, max: 2000 },
      sections: {
        Breakfast: { dishes: [], meals: [] },
        Lunch: { dishes: [], meals: [] },
        Dinner: { dishes: [], meals: [] },
      },
    },
    mealPlan: [],
    mealPlanStatus: "none",
  };

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: { data: mockUser } }); // Mocking user data fetch
  });

  test("renders loading state initially", async () => {
    render(<MealPlanPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  test("renders user and 'No meal plan generated yet' if mealPlan is empty", async () => {
    render(<MealPlanPage />);
    await waitFor(() => {
      expect(screen.getByText(/No meal plan generated yet/i)).toBeInTheDocument();
    });
  });

  test("generates meal plan on button click", async () => {
    const mockMealPlan = [
      {
        sections: {
          Breakfast: { label: "Oatmeal", totalCalories: 200, caloriesPerServing: 200, assigned: "Breakfast", cuisineType: ["American"] },
          Lunch: { label: "Salad", totalCalories: 400, caloriesPerServing: 400, assigned: "Lunch", cuisineType: ["Mediterranean"] },
          Dinner: { label: "Stir Fry", totalCalories: 600, caloriesPerServing: 600, assigned: "Dinner", cuisineType: ["Asian"] },
        },
      },
    ];

    mockedAxios.post.mockResolvedValueOnce({ data: { mealPlan: mockMealPlan } });

    render(<MealPlanPage />);

    await waitFor(() => {
      expect(screen.getByText(/Generate Meal Plan/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Generate Meal Plan/i));

    await waitFor(() => {
      // Check if the meals are rendered
      expect(screen.getByText(/Oatmeal/i)).toBeInTheDocument();
      expect(screen.getByText(/Salad/i)).toBeInTheDocument();
      expect(screen.getByText(/Stir Fry/i)).toBeInTheDocument();
    });
  });

  test("opens MealDetails modal on 'View Recipe' click", async () => {
    const mockMealPlan = [
      {
        sections: {
          Breakfast: { label: "Oatmeal", totalCalories: 200, caloriesPerServing: 200, assigned: "Breakfast", cuisineType: ["American"] },
          Lunch: { label: "Salad", totalCalories: 400, caloriesPerServing: 400, assigned: "Lunch", cuisineType: ["Mediterranean"] },
          Dinner: { label: "Stir Fry", totalCalories: 600, caloriesPerServing: 600, assigned: "Dinner", cuisineType: ["Asian"] },
        },
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: { data: { ...mockUser, mealPlan: mockMealPlan } } }); // Mocking user with meal plan

    render(<MealPlanPage />);

    await waitFor(() => {
      const buttons = screen.getAllByText(/View Recipe/i);
      fireEvent.click(buttons[0]);
    });

    await waitFor(() => {
    // get the modal element
    const modal = screen.getByTestId("meal-details");
    expect(modal).toBeInTheDocument();

    // query inside the modal only
    expect(within(modal).getByText(/Oatmeal/i)).toBeInTheDocument();
    });
  });
});
