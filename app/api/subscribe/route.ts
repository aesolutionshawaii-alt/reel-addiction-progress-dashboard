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
      range: "Subscribers!A:B", // A = email, B = timestamp
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, new Date().toISOString()]],
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Subscribed: ${email}`,
    });
  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

