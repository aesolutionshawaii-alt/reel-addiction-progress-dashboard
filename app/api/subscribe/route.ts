import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Google Sheets auth
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    // Append to "Subscribers" tab
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Subscribers!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, new Date().toISOString()]],
      },
    });

    // Send confirmation email via Resend
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reel Addiction III <updates@yourdomain.com>",
        to: email,
        subject: "You're Subscribed to Reel Addiction III Updates",
        html: `
          <p>Aloha,</p>
          <p>You’ve been subscribed to Reel Addiction III trip notifications. We’ll email you when the checklist or schedule changes so you’re always in the loop.</p>
          <p>Mahalo,<br/>Captain & Crew</p>
        `,
      }),
    });

    return NextResponse.json({
      ok: true,
      message: `Subscribed and confirmation sent to ${email}`,
    });
  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Subscribe endpoint is alive ✅",
  });
}

