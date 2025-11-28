/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("LoginPage", () => {
  let pushMock: jest.Mock;

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Password1!" } });
  };

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    render(<LoginPage />);
  });

  test("renders inputs and login button", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /login here/i });
    expect(button).toBeDisabled();
  });

  test("enables button when fields are filled", () => {
    fillForm();
    const button = screen.getByRole("button", { name: /login here/i });
    expect(button).not.toBeDisabled();
  });

  test("shows loading state when submitting", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: "Login successful" } });
    fillForm();

    const button = screen.getByRole("button", { name: /login here/i });
    fireEvent.click(button);

    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile"); // verifies redirection on successful login
      expect(toast.success).toHaveBeenCalledWith("Login successful");
    });
  });

  test("shows error toast on failed login", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    fillForm();
    const button = screen.getByRole("button", { name: /login here/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  test("forgot password button navigates correctly", () => {
    const forgotButton = screen.getByText(/forgot password/i);
    fireEvent.click(forgotButton);
    expect(pushMock).toHaveBeenCalledWith("/forgotpassword");
  });
});
