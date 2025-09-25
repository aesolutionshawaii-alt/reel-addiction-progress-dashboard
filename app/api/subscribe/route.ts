import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ Google Sheets auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ Append subscriber to Google Sheet
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
      range: "Subscribers!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, new Date().toISOString()]],
      },
    });

    console.log("📒 Google Sheets append response:", appendResponse.status);

    // ✅ Send Resend notification directly
    const resendResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // replace with verified domain when ready
      to: "aesolutionshawaii@gmail.com",
      subject: "Website Project Checklist Updated",
      html: `
        <p>Aloha,</p>
        <p>The internal website overhaul checklist has changed (tab: <b>Progress</b>).</p>
      `,
    });

    console.log("📨 Resend response:", resendResponse);

    return NextResponse.json({
      ok: true,
      message: `Subscribed ${email}, added to Google Sheets, and sent notification.`,
    });
  } catch (err: any) {
    console.error("❌ Subscribe error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
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


