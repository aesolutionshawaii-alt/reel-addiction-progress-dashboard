import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ ok: false, error: "No email provided" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Subscribers!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, new Date().toISOString()]],
      },
    });

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
