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

    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // 1. Get subscribers
    const subsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Subscribers!A:A",
    });
    const subscribers = subsRes.data.values?.flat().filter(Boolean) || [];
    if (subscribers.length === 0) {
      return NextResponse.json({ ok: true, message: "No subscribers yet." });
    }

    // 2. Get checklist
    const checklistRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Checklist!A:Z", // adjust tab name
    });
    const checklist = checklistRes.data.values || [];

    // 3. Get last snapshot
    const snapshotRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "LastSnapshot!A:Z",
    });
    const snapshot = snapshotRes.data.values || [];

    // 4. Compare (simple string compare)
    const currentStr = JSON.stringify(checklist);
    const lastStr = JSON.stringify(snapshot);

    if (currentStr === lastStr) {
      return NextResponse.json({ ok: true, message: "No changes." });
    }

    // 5. Send emails via Resend
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
        html: `<p>The Reel Addiction III trip checklist has been updated.</p>
               <pre>${JSON.stringify(checklist, null, 2)}</pre>`,
      }),
    });

    if (!sendRes.ok) throw new Error("Failed to send emails");

    // 6. Update snapshot tab
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "LastSnapshot!A:Z",
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "LastSnapshot!A1",
      valueInputOption: "RAW",
      requestBody: { values: checklist },
    });

    return NextResponse.json({
      ok: true,
      message: `Changes found — notified ${subscribers.length} subscribers.`,
    });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

