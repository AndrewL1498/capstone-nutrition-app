/**
 * @jest-environment jsdom
 */



import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpPage from "@/app/signup/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import '@testing-library/jest-dom';


// Mock axios
jest.mock("axios"); // Mocks the axios module to intercept HTTP requests
const mockedAxios = axios as jest.Mocked<typeof axios>; // Type assertion to treat axios as a mocked version of itself

// Mock next/navigation useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SignUpPage", () => {
  let pushMock: jest.Mock; // declares a variable pushMock of type jest.Mock to hold the mock function for router.push

  // Simulates user filling out the signup form
  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } }); 
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Password1!" } });
  };

  beforeEach(() => {
    pushMock = jest.fn(); // initializes pushMock as a new jest mock function before each test
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock }); //mocks useRouter to return an object with the push method set to pushMock
    render(<SignUpPage />); //renders the SignUpPage component before each test
  });

  test("renders all inputs and button in disabled state initially", () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("No signup");
  });

  test("enables button and updates text when all fields are filled", () => {
    fillForm();
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Signup");
  });

  test("displays error message if signup fails", async () => {
    mockedAxios.post.mockRejectedValueOnce({ // Simulates a failed signup by mocking axios.post to reject with an error
      response: { data: { message: "Signup failed" } },
    });

    fillForm();
    fireEvent.click(screen.getByRole("button")); // Simulates clicking the signup button

    await waitFor(() => {
      expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });
  });

  test("disables button and shows 'Processing' during signup", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: "Signup successful" } });

    fillForm();
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  test("redirects to login page on successful signup", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: "Signup successful" } });

    fillForm();
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login"); // Asserts that router.push was called with "/login" after successful signup
    });
  });
});