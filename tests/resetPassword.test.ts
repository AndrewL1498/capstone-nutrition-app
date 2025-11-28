import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import User from "@/models/userModel";
import { POST as resetPasswordHandler } from "@/app/api/users/resetPasswordRoute/route";
import { connect } from "@/dbConfig/dbConfig";

dotenv.config();

describe("POST /api/users/resetPasswordRoute (integration)", () => {
  let testUser: any;
  let validToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    await connect();
    });

    beforeEach(async () => {

    await User.deleteMany({});
    
    // Create a user with a valid forgotPasswordToken
    const now = Date.now();
    validToken = "valid-token-123";
    expiredToken = "expired-token-456";

    testUser = await User.create({
      username: "resetuser",
      email: "reset@test.com",
      password: "OldPassword1!",
      forgotPasswordToken: validToken,
      forgotPasswordTokenExpiry: now + 1000 * 60 * 60, // 1 hour in the future
    });

    // User with expired token
    await User.create({
      username: "expireduser",
      email: "expired@test.com",
      password: "OldPassword1!",
      forgotPasswordToken: expiredToken,
      forgotPasswordTokenExpiry: now - 1000 * 60, // 1 minute in the past
    });
    });
  

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test("should reset password successfully with valid token", async () => {
    const req = new NextRequest("http://localhost/api/users/resetPasswordRoute", {
      method: "POST",
      body: JSON.stringify({
        token: validToken,
        newPassword: "NewPass1!",
        confirmPassword: "NewPass1!",
      }),
    });

    const res = await resetPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Password reset successful");

    // Verify password was hashed in DB
    const updatedUser = await User.findOne({ email: "reset@test.com" });
    expect(updatedUser?.password).not.toBe("NewPass1!");
    const isMatch = await bcrypt.compare("NewPass1!", updatedUser!.password);
    expect(isMatch).toBe(true);
  });

  test("should return 400 for invalid or expired token", async () => {
    const req = new NextRequest("http://localhost/api/users/resetPasswordRoute", {
      method: "POST",
      body: JSON.stringify({
        token: expiredToken,
        newPassword: "NewPass1!",
        confirmPassword: "NewPass1!",
      }),
    });

    const res = await resetPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid or expired token");
  });

  test("should return 400 if passwords do not match", async () => {
    const req = new NextRequest("http://localhost/api/users/resetPasswordRoute", {
      method: "POST",
      body: JSON.stringify({
        token: validToken,
        newPassword: "NewPass1!",
        confirmPassword: "Mismatch1!",
      }),
    });

    const res = await resetPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Passwords do not match");
  });

  test("should return 400 if password too short", async () => {
    const req = new NextRequest("http://localhost/api/users/resetPasswordRoute", {
      method: "POST",
      body: JSON.stringify({
        token: validToken,
        newPassword: "Ab1!",
        confirmPassword: "Ab1!",
      }),
    });

    const res = await resetPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Password must be at least 6 characters long");
  });

  test("should return 400 if password has no special character", async () => {
    const req = new NextRequest("http://localhost/api/users/resetPasswordRoute", {
      method: "POST",
      body: JSON.stringify({
        token: validToken,
        newPassword: "Password123",
        confirmPassword: "Password123",
      }),
    });

    const res = await resetPasswordHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Password must contain at least one special character");
  });
});

