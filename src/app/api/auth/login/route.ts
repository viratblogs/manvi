import { NextResponse } from "next/server";
import { isUidAllowed } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing user identifier." }, { status: 400 });
    }

    if (!isUidAllowed(uid)) {
      return NextResponse.json(
        {
          error: `UID "${uid}" for ${email || "user"} is not authorized in NEXT_PUBLIC_ADMIN_UID allow-list.`,
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "admin_session",
      value: uid,
      httpOnly: false, // Accessible client-side & server-side for Next.js App Router
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
