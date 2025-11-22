import dotenv from 'dotenv';
import { POST as loginHandler } from "@/app/api/users/loginRoute/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

dotenv.config();

beforeAll(async () => {
    await connect();
});

beforeEach(async () =>{
    await mongoose.connection.collection("users").deleteMany({});

        await User.create({
        username: "Andrewtwo",
        email: "andrewtwo@test.com",
        password: await bcrypt.hash("Password123!", 10),
    });
})

afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({}); //I have a deleteMany here as well as the beforeEach so that way when all the tests are done the database gets cleared and doesn't leave anything behind the next time the tests are run
    await mongoose.connection.close();
})


const mockRequest = (body: any) => {
    return new NextRequest("http://localhost/api/loginRoute",{ //The url (http://localhost/api/loginRoute) doesn't matter for my tests, as long as something is there
        method: "POST",
                headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
};


describe("Login tests", () =>{
    test("login successful", async () => {
        const user = {email: "andrewtwo@test.com", password: "Password123!"}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.message).toBe("Login successful");
    });

    test("login works with uppercase email", async () => {
        const user = {email: "ANDREWtwo@test.com", password: "Password123!"}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.message).toBe("Login successful");
    });

    test("email must not be empty", async () => {
        const user = {email: "", password: "Password123!"}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Please enter your email address");
    });

    test("User not found", async () => {
        const user = {email: "andy@test.com", password: "Password123!"}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("User not found");
    });

        test("password must not be empty", async () => {
        const user = {email: "andrewtwo@test.com", password: ""}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Please enter your password");
    });

    test("Invalid password", async () => {
        const user = {email: "andrewtwo@test.com", password: "Pass123!"}

        const req = mockRequest(user);

        const res = await loginHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Invalid password");
    });

    // test("Login sets token cookie", async () => {
    //     const user = {email: "andrewtwo@test.com", password: "Password123!"};
    //     const req = mockRequest(user);
    //     const res = await loginHandler(req);
    //     console.log(res)
    //     const tokenCookie = res.cookies.get("token");
    //     expect(tokenCookie).toBeDefined();
    //     expect(tokenCookie?.httpOnly).toBe(true);
    //     });
})
