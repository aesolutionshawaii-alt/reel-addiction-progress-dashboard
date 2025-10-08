import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reel Addiction III <onboarding@resend.dev>",
        to: ["yourname@gmail.com"], // <-- put your email here
        subject: "Resend test from test-send route",
        html: "<p>Aloha — this is a direct Resend test.</p>",
      }),
    });

    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, body: text });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
