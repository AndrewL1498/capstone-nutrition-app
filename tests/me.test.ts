import dotenv from 'dotenv';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { GET as meHandler } from "@/app/api/users/me/route";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

dotenv.config();

describe("GET /api/users/me (integration)", () => {
  let testUser: any;
  let token: string;

  beforeAll(async () => {
    process.env.TOKEN_SECRET = "testsecret123"; // required for signing tokens
    process.env.MONGODB_URI = process.env.MONGODB_URI_TEST; // ensure test DB

    await connect(); // real DB connection

     await User.deleteMany({});

    // Create a user in the DB
    testUser = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: "hashedpassword",
    });

    // Create a real JWT token with the user's _id
    token = jwt.sign({ id: testUser._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.close();
  });

  test("should return user data when token is valid", async () => {
    // Create a NextRequest and attach cookie
    const req = new NextRequest("http://localhost/api/users/me", {
      headers: {
        cookie: `token=${token}`,
      },
    });

    const res = await meHandler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("User found");
    expect(data.data.email).toBe("test@test.com");
    expect(data.data.password).toBeUndefined(); // ensure password is removed
  });

  test("should return 400 when token missing", async () => {
    const req = new NextRequest("http://localhost/api/users/me");

    const res = await meHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/token/i);
  });

  test("should return 400 if user does not exist", async () => {
    // token points to a different ID
    const fakeToken = jwt.sign({ id: "000000000000000000000000" }, process.env.TOKEN_SECRET!);

    const req = new NextRequest("http://localhost/api/users/me", {
      headers: {
        cookie: `token=${fakeToken}`,
      },
    });

    const res = await meHandler(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/user/i);
  });
});
