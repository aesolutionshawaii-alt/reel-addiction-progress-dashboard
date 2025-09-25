import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Google Sheets auth
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    const sheets = google.sheets({ version: "v4", auth });

    // 1. Get subscribers
    const subsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Subscribers!A:A",
    });
    const subscribers = subsRes.data.values?.flat().filter(Boolean) || [];

    // 2. Get checklist data
    const checklistRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Checklist!A:Z", // adjust tab name/range
    });
    const checklist = checklistRes.data.values || [];

    // TODO: Compare checklist to previous version
    // For now, we’ll just notify every time this endpoint runs

    // 3. Send email via Resend
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reel Addiction III <updates@yourdomain.com>",
        to: subscribers,
        subject: "Checklist Updated",
        html: `<p>The Reel Addiction III trip checklist has been updated.</p>`,
      }),
    });

    if (!sendRes.ok) throw new Error("Failed to send emails");

    return NextResponse.json({
      ok: true,
      message: `Notified ${subscribers.length} subscribers`,
    });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
