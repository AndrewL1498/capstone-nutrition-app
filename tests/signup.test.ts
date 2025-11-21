import dotenv from 'dotenv';
import { POST as signupHandler } from "@/app/api/users/signupRoute/route";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";


dotenv.config();

beforeAll(async() =>{
    await connect();
});

beforeEach(async () => {
    await mongoose.connection.collection('users').deleteMany({});
})
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
    test("should create a new user with valid credentials", async () => {
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

        const userInDb = await User.findOne({ email: "andrew@test.com" });
        expect(userInDb).not.toBeNull();
        expect(userInDb!.username).toBe(validUser.username);
        expect(userInDb!.email).toBe(validUser.email.toLowerCase());


    });

    test("user already exists", async () => {
        const validUser = {username:"Andrew", email: "andrew@test.com", password: "Password123!"};
        const req = mockRequest(validUser);
        const res = await signupHandler(req);

        const secondReq = mockRequest(validUser);
        const secondRes = await signupHandler(secondReq);

        const data = await secondRes.json();

        expect(secondRes.status).toBe(400);
        expect(data.message).toBe("User already exists");  
        });
    });

describe("Testing username",() => {
    test("Username must exist", async () => {
        const validUser = { username: "", email: "andrew@Test.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("User must have a username");
        });

    test("Username must be at least 2 characters long", async () => {
        const validUser = { username: "A", email: "andrew@Test.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Username must be at least 2 characters long");
        });

    test("Username must be less than 20 characters", async () => {
        const validUser = { username: "Andrewwwwwwwwwwwwwwww", email: "andrew@Test.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Username must be less than 20 characters");
        });
    });

describe("Testing email",() => {
    test("email is normalized to lowercase", async () => {
        const validUser = { username: "Andrew", email: "ANDREW@Test.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(data.savedUser.email).toBe("andrew@test.com");
        });

    test("User has to insert an email", async () => {
        const validUser = { username: "Andrew", email: "", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(data.message).toBe("User must have an email");
        });

    test("Email must contain @ and .", async () => {
        const validUser = { username: "Andrew", email: "andrewtest", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(data.message).toBe("Invalid email address");
        });

    test("Email must have at least 6 characters and no more than 256", async () => {
        const validUser = { username: "Andrew", email: "@.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(data.message).toBe("Email address must be greater than 5 and less than 254 characters");
        });
    });

describe("Testing passord",() => {
    test("Password must be at least 6 characters long", async () => {
        const validUser = {username:"Andrew", email: "andrew@test.com", password: ""};
        const req = mockRequest(validUser);
        const res = await signupHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Password must be at least 6 characters long")
    });

    test("Password must not me longer than 30 characters", async () => {
        const validUser = {username:"Andrew", email: "andrew@test.com", password: "P!000000000000000000000000000000000"};
        const req = mockRequest(validUser);
        const res = await signupHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Password can be no longer than 30 characters")
    });

    test("Password must contain at least one special character", async () => {
        const validUser = {username:"Andrew", email: "andrew@test.com", password: "Password123"};
        const req = mockRequest(validUser);
        const res = await signupHandler(req);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe("Password must contain at least one special character")
    });

        test("make sure password it hashed", async () => {
        const validUser = { username: "Andrew", email: "andrew@Test.com", password: "Password123!" };
        const req = mockRequest(validUser);
        const res = await signupHandler(req);
        const data = await res.json();

        expect(data.savedUser.password).not.toBe(validUser.password);
    });
});
