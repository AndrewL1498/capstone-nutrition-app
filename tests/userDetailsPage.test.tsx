/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserDetailsPage from "@/app/userDetails/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import '@testing-library/jest-dom';

// ====================
// MOCKS
// ====================


// Mock database connection
jest.mock("@/dbConfig/dbConfig", () => ({
  connect: jest.fn(),
}));

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock next/navigation useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Navbar to avoid rendering actual navbar
jest.mock("@/app/Components/Navbar", () => () => <div>Navbar</div>);

describe("UserDetailsPage", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks();
  });

  test("renders basic elements", () => {
    render(<UserDetailsPage />);
    expect(screen.getByText(/Meal Plan Preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/Diets/i)).toBeInTheDocument();
    expect(screen.getByText(/Allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/Calories/i)).toBeInTheDocument();
    expect(screen.getByText(/Breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    expect(screen.getByText(/Dinner/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Meal Plan/i)).toBeInTheDocument();
  });

  test("toggles diet buttons", async () => {
    render(<UserDetailsPage />);
    const firstDietBtn = screen.getAllByRole("button", { name: /Vegan|Vegetarian|Keto/i })[0]; // the zero index gets the first button
    fireEvent.click(firstDietBtn);
    expect(firstDietBtn).toHaveClass("active");
    fireEvent.click(firstDietBtn);
    expect(firstDietBtn).not.toHaveClass("active");
  });

  test("toggles allergy buttons", async () => {
    render(<UserDetailsPage />);
    const firstAllergyBtn = screen.getAllByRole("button", { name: /Gluten|Peanut|Dairy/i })[0];
    fireEvent.click(firstAllergyBtn);
    expect(firstAllergyBtn).toHaveClass("active");
    fireEvent.click(firstAllergyBtn);
    expect(firstAllergyBtn).not.toHaveClass("active");
  });

  test("toggles dish types for breakfast/lunch/dinner", async () => {
    render(<UserDetailsPage />);
    const breakfastBtn = screen.getAllByText(/Main course|Side dish|Snack/i)[0];
    fireEvent.click(breakfastBtn);
    expect(breakfastBtn).toHaveClass("active");
    fireEvent.click(breakfastBtn);
    expect(breakfastBtn).not.toHaveClass("active");
  });

test("updates calorie inputs", async () => {
  render(<UserDetailsPage />);

  // query by aria-labels
  const minInput = screen.getByRole("spinbutton", { name: /min calories/i }) as HTMLInputElement; //any input with type="number" has role spinbutton
  const maxInput = screen.getByRole("spinbutton", { name: /max calories/i }) as HTMLInputElement;

  // Change from current value to new value
  fireEvent.change(minInput, { target: { value: "1200" } });
  fireEvent.change(maxInput, { target: { value: "2200" } });

  expect(minInput.value).toBe("1200");
  expect(maxInput.value).toBe("2200");
});


  test("generate meal plan success", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    render(<UserDetailsPage />);
    const btn = screen.getByText(/Generate Meal Plan/i);
    fireEvent.click(btn);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Meal plan generated successfully!"));
    expect(pushMock).toHaveBeenCalledWith("/mealPlan");
  });

  test("generate meal plan API failure shows toast error", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: false, message: "Cannot generate" } });
    render(<UserDetailsPage />);
    fireEvent.click(screen.getByText(/Generate Meal Plan/i));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cannot generate"));
  });

  test("generate meal plan network error shows toast error", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
    render(<UserDetailsPage />);
    fireEvent.click(screen.getByText(/Generate Meal Plan/i));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Network error"));
  });
});
