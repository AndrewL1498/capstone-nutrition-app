/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import '@testing-library/jest-dom';

// ====================
// MOCKS
// ====================

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




describe("ProfilePage", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks(); // reset mocks before each test
  });

  test("renders loading initially", () => {
    render(<ProfilePage />);
    expect(screen.getByText(/loading user details/i)).toBeInTheDocument();
  });

  test("displays username after fetch", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Hi Andrew!/i)).toBeInTheDocument();
    });
  });

  test("navigates when buttons are clicked", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } });

    render(<ProfilePage />);

    await waitFor(() => screen.getByText(/Hi Andrew!/i));

    fireEvent.click(screen.getByText(/Meal Plan Preferences/i));
    expect(pushMock).toHaveBeenCalledWith("/userDetails");

    fireEvent.click(screen.getByText(/Go to Meal Plan/i));
    expect(pushMock).toHaveBeenCalledWith("/mealPlan");
  });

  test("logout calls API and redirects", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } }); // for user fetch
    mockedAxios.get.mockResolvedValueOnce({}); // for logout

    render(<ProfilePage />);
    await waitFor(() => screen.getByText(/Hi Andrew!/i));

    fireEvent.click(screen.getByText(/Logout/i));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));

    // Ensure toast.success called
    expect(toast.success).toHaveBeenCalledWith("Logout successful");
  });

  test("delete profile calls API and redirects", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } }); // fetch user
    mockedAxios.delete.mockResolvedValueOnce({}); // delete profile

    render(<ProfilePage />);
    await waitFor(() => screen.getByText(/Hi Andrew!/i));

    fireEvent.click(screen.getByText(/Delete Profile/i));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/signup"));

    // Ensure toast.success called
    expect(toast.success).toHaveBeenCalledWith("Profile deleted successfully");
  });

  test("shows toast error if fetching username fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API error"));

    render(<ProfilePage />);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Failed to load user details"));
  });

  test("shows toast error if delete profile fails", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } });
    mockedAxios.delete.mockRejectedValueOnce({ response: { data: { message: "Cannot delete" } } });

    render(<ProfilePage />);
    await waitFor(() => screen.getByText(/Hi Andrew!/i));

    fireEvent.click(screen.getByText(/Delete Profile/i));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cannot delete"));
  });

  test("shows toast error if logout fails", async () => {
    const mockUser = { username: "Andrew" };
    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } }); // fetch user
    mockedAxios.get.mockRejectedValueOnce(new Error("Logout failed")); // logout fails

    render(<ProfilePage />);
    await waitFor(() => screen.getByText(/Hi Andrew!/i));

    fireEvent.click(screen.getByText(/Logout/i));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Logout failed"));
  });
});
