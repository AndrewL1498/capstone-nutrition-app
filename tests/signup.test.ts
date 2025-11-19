import dotenv from 'dotenv';
import { POST as signupHandler } from "@/app/api/users/signupRoute/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";

dotenv.config();

beforeAll(async() =>{
    await connect();
});

afterAll(async () => {
    await mongoose.connection.collection('users_test').deleteMany({});
    await mongoose.connection.close();
})

const mockRequest = (body: any) => {
    return new NextRequest("http://localhost/api/signup",{
        method: "POST",
        body: JSON.stringify(body),
    });
};

describe("Signup successful", () => {
    test("should create a new user with valid credentials", async () =>{
        const validUser = {username:"Andrew", email: "andrew@test.com", password: "Password123!"};

        const req = mockRequest(validUser);

        const res = await signupHandler(req);

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.message).toBe("User created successfully");
        expect(data.user).toHaveProperty("email", validUser.email);
        expect(data.user).toHaveProperty("username", validUser.username);
    })
});
