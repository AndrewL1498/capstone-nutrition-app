import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect(); //Establishes a connection to the database using the connect function from dbConfig

export async function GET(request: NextRequest) {
    try {
       const userId = await getDataFromToken(request); // Extract user ID from the token in the request cookies
       const user = await User.findOne({ _id: userId }).select("-password"); // Query the User model to find the user by ID. Selects all fields except the password.
         return NextResponse.json({
            message: "User found",
            data: user
          });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}