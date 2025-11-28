import dotenv from "dotenv";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import User from "@/models/userModel";
import { POST as verifyEmailHandler } from "@/app/api/users/verifyemail/route";
import { connect } from "@/dbConfig/dbConfig";

dotenv.config();

describe("POST /api/users/verifyEmailRoute (integration)", () => {
  let testUser: any;
  let validToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    await connect();

    const now = Date.now();

    // Valid token user
    validToken = "valid-verify-token";
    testUser = await User.create({
      username: "verifyuser",
      email: "verify@test.com",
      password: "SomePassword1!",
      verifyToken: validToken,
      verifyTokenExpiry: now + 1000 * 60 * 60, // 1 hour in future
      isVerified: false,
    });

    // Expired token user
    expiredToken = "expired-verify-token";
    await User.create({
      username: "expiredverify",
      email: "expiredverify@test.com",
      password: "SomePassword1!",
      verifyToken: expiredToken,
      verifyTokenExpiry: now - 1000 * 60, // 1 minute in past
      isVerified: false,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test("should verify email successfully with valid token", async () => {
    const req = new NextRequest("http://localhost/api/users/verifyEmailRoute", {
      method: "POST",
      body: JSON.stringify({ token: validToken }),
    });

    const res = await verifyEmailHandler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Email verified successfully");
    expect(data.success).toBe(true);

    // Check DB changes
    const updatedUser = await User.findOne({ email: "verify@test.com" });
    expect(updatedUser?.isVerified).toBe(true);
    expect(updatedUser?.verifyToken).toBeUndefined();
    expect(updatedUser?.verifyTokenExpiry).toBeUndefined();
  });

  test("should return 400 for invalid or expired token", async () => {
    const req = new NextRequest("http://localhost/api/users/verifyEmailRoute", {
      method: "POST",
      body: JSON.stringify({ token: expiredToken }),
    });

    const res = await verifyEmailHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid token");
  });

  test("should return 400 for completely invalid token", async () => {
    const req = new NextRequest("http://localhost/api/users/verifyEmailRoute", {
      method: "POST",
      body: JSON.stringify({ token: "nonexistent-token" }),
    });

    const res = await verifyEmailHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid token");
  });
});
