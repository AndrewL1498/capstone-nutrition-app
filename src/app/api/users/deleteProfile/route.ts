import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {NextRequest, NextResponse} from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function DELETE(request: NextRequest){
    try{
        const userId = await getDataFromToken(request);
        if (!userId) {
          return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

    await User.findByIdAndDelete(userId);
    const res = NextResponse.json({ success: true, message: "Profile deleted successfully" });
    res.cookies.set("token", "", { path: "/", maxAge: 0 }); // clears cookie
    return res;
    
    } catch (err) {
    console.error("Error deleting profile:", err);
    return NextResponse.json({ success: false, message: "Failed to delete profile" }, { status: 500 });
  }
}