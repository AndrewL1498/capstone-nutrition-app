// tests/forgotPassword.test.ts
import dotenv from "dotenv";
import { NextRequest } from "next/server";
import User from "@/models/userModel";
import { POST as forgotPasswordHandler } from "@/app/api/users/forgotPasswordRoute/route";
import { sendEmail } from "@/helpers/mailer";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";


dotenv.config();


connect(); // Make sure test DB is connected

jest.mock("@/helpers/mailer"); // mock the email sender

describe("Forgot Password Route", () => {
  let testUser: any;

  beforeAll(async () => {
    // create a test user in DB
    testUser = await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    });
  });

  afterAll(async () => {
    // clean up test DB
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(() => {
    jest.clearAllMocks(); // reset mocks after each test
  });

  test("should send reset email for existing user", async () => {
    const req = new NextRequest("http://localhost/api/users/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email }),
    });

    const res = await forgotPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Reset email sent");

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ //expect here is checking to see if these fields are occupied, and any extra fields will be over looked, meaning it will still pass if there are additional fields
        email: testUser.email,
        emailType: "RESET",
        userId: testUser._id,
      })
    );
  });

  test("should respond 200 even if email does not exist", async () => {
    const req = new NextRequest("http://localhost/api/users/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@example.com" }),
    });

    const res = await forgotPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe(
      "If an account with this email exists, a reset link has been sent"
    );

    expect(sendEmail).not.toHaveBeenCalled();
  });

  test("should return 500 if User.findOne throws an error", async () => {
    // temporarily mock User.findOne to throw
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockRejectedValue(new Error("DB failure"));

    const req = new NextRequest("http://localhost/api/users/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email }),
    });

    const res = await forgotPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("DB failure");

    // restore original method
    User.findOne = originalFindOne;
  });
});
