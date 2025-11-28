// tests/logout.test.ts
import { GET as logoutHandler } from "@/app/api/users/logout/route";
import { NextResponse } from "next/server";

describe("Logout Route", () => {

  test("should return success and clear token cookie", async () => {
    const res = await logoutHandler();

    const data = await res.json();

    // ✅ Check response body
    expect(data.success).toBe(true);
    expect(data.message).toBe("Logout successful");

    // ✅ Check cookie clearing
    const tokenCookie = res.cookies.get("token");

    // value should be cleared
    expect(tokenCookie?.value).toBe("");

    // expires should be 0 or a past date
    if (tokenCookie?.expires instanceof Date) {
    expect(tokenCookie.expires.getTime()).toBe(0);
    } else {
    expect(tokenCookie?.expires).toBe(0);
    }
  });

  test("should return 500 if something throws", async () => {
 // Temporarily mock response.cookies.set to throw
  const originalSet = Object.getOwnPropertyDescriptor(NextResponse.prototype, "cookies")?.value; // Look at the NextResponse prototype, find the property named 'cookies', and try to access the value property of its property descriptor. However, because cookies is actually a getter function not a normal value property, this will return undefined. We access this so we can reset it later

  //Here we update the getter function. Any time the logout route gets called, this will get called
  Object.defineProperty(NextResponse.prototype, "cookies", {
    get() {
      return {
        set: () => { throw new Error("Fake error"); }, //set is a method on the object returned by the getter
      };
    },
  });

    const res = await logoutHandler(); //calls the logout route
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Fake error");

  // Restore original cookies property. We do this because NextResponse is a like a class that shares prototypes with all instances of NextResponse. We want to reset this back to it's original prototype once we are done testing
  if (originalSet) {
    Object.defineProperty(NextResponse.prototype, "cookies", { value: originalSet });
  }
  });

});
