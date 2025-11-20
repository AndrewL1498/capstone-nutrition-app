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
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.close();
})

const mockRequest = (body: any) => {
    return new NextRequest("http://localhost/api/signup",{
        method: "POST",
                headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
};

describe("Signup successful", () => {
    test("should create a new user with valid credentials", async () =>{
        const validUser = {username:"Andrew", email: "andrew@test.com", password: "Password123!"};

        const req = mockRequest(validUser);

        const res = await signupHandler(req);
        console.log(req.body)

        const data = await res.json();
        console.log("user data:", data)

        expect(res.status).toBe(200);
        expect(data.message).toBe("User created successfully");
        expect(data.savedUser).toHaveProperty("email", validUser.email);
        expect(data.savedUser).toHaveProperty("username", validUser.username);
    })
});
