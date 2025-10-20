import {NextResponse} from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({message: "Logout successful", success: true});

        response.cookies.set("token", "", 
            {httpOnly: true, expires: new Date(0)}); // Set the cookie expiration date to a past date to delete it
        
            return response;
    
        } catch (error: any) {
        return NextResponse.json({error: error.message},
        {status: 500})
    }
}