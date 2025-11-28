import dotenv from 'dotenv';
import { DELETE as deleteProfileHandler } from "@/app/api/users/deleteProfile/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

// ----------------------------
// Setup / Teardown
// ----------------------------
beforeAll(async () => {
    await connect();
});

let dbUser: any;

beforeEach(async () => {
    // Clear users
    await mongoose.connection.collection('users').deleteMany({});

    // Create a test user
    dbUser = await User.create({
        username: "DeleteTestUser",
        email: "delete@test.com",
        password: await bcrypt.hash("Password123!", 10),
    });
});

afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.close();
});

// ----------------------------
// Helper function: create auth request
// ----------------------------
function mockAuthRequest(userId: string | null) {

    const req = new NextRequest("http://localhost/api/users/deleteProfile", {
        method: "DELETE",
        headers: {
            "Content-type": "application/json",
        }
    });

    if (userId) {
        const token = jwt.sign({ id: userId }, process.env.TOKEN_SECRET!, { expiresIn: "1h" });
        req.cookies.set("token", token);
    }

    return req;
}

// ----------------------------
// Tests
// ----------------------------
describe("DELETE /api/users/deleteProfile", () => {

    test("successfully deletes profile and clears cookie", async () => {
        const req = mockAuthRequest(dbUser._id.toString());
        const res = await deleteProfileHandler(req);

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Profile deleted successfully");

        // Check cookie cleared
        const tokenCookie = res.cookies.get("token");
        expect(tokenCookie?.value).toBe("");
        expect(tokenCookie?.maxAge).toBe(0);

        // Check DB: user should be deleted
        const deletedUser = await User.findById(dbUser._id);
        expect(deletedUser).toBeNull();
    });

    test("returns 401 if token is missing", async () => {
        const req = mockAuthRequest(null);
        const res = await deleteProfileHandler(req);

        expect(res.status).toBe(401);

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("Unauthorized");

        // DB: user should still exist
        const existingUser = await User.findById(dbUser._id);
        expect(existingUser).not.toBeNull();
    });

    test("returns 401 if token is invalid", async () => {
        const req = new NextRequest("http://localhost/api/users/deleteProfile", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        req.cookies.set("token", "this.is.an.invalid.token");

        const res = await deleteProfileHandler(req);
        expect(res.status).toBe(401);

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("Unauthorized");

        // DB: user should still exist
        const existingUser = await User.findById(dbUser._id);
        expect(existingUser).not.toBeNull();
    });

    test("returns 500 if database deletion fails", async () => {
    // Mock User.findByIdAndDelete to throw an error
    const originalFindByIdAndDelete = User.findByIdAndDelete;
    User.findByIdAndDelete = jest.fn().mockImplementation(() => {
        throw new Error("Database failure");
    });

    const req = new NextRequest("http://localhost/api/users/deleteProfile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    // Add valid token so it passes auth
    const token = jwt.sign({ id: dbUser._id.toString() }, process.env.TOKEN_SECRET!, { expiresIn: "1h" });
    req.cookies.set("token", token);

    const res = await deleteProfileHandler(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Failed to delete profile");

    // Restore the original method
    User.findByIdAndDelete = originalFindByIdAndDelete;
});

});
