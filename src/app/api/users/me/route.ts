import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(request: NextRequest) {

  await connect();

    try {
       const userId = await getDataFromToken(request); // Extract user ID from the token in the request cookies
       
      if (!userId) {
      // Explicitly return 400 if token is missing or invalid
      return NextResponse.json({ error: "Token missing or invalid" }, { status: 400 });
    }
       
       const user = await User.findOne({ _id: userId }).select("-password"); // Query the User model to find the user by ID. Selects all fields except the password.
         
           if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
       
       
       
       return NextResponse.json({
            message: "User found",
            data: user
          });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}