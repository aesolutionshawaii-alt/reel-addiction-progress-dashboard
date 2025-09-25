import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { note } = await req.json().catch(() => ({ note: "" }));

    // 1) Google Sheets auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // 2) Read subscribers (column A on "Subscribers" tab)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
      range: "Subscribers!A:A",
    });
    const raw = (res.data.values || []).flat().map(String);
    const emails = Array.from(
      new Set(
        raw.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.toLowerCase()))
      )
    );

    if (emails.length === 0) {
      return NextResponse.json({ ok: false, error: "No subscribers found." }, { status: 404 });
    }

    // 3) Send one email to all subscribers
    const html = `
      <p>Aloha,</p>
      <p>The <b>Website Progress Tracker</b> was just updated${note ? `: <b>${note}</b>` : ""}.</p>
      <p><a href="https://reel-addiction-progress-dashboard.vercel.app/progress" target="_blank">
        Open Progress Tab
      </a></p>
    `;

    const sendResp = await resend.emails.send({
      from: "Reel Addiction III Dashboard <onboarding@resend.dev>", // swap to your domain later
      to: emails, // broadcast
      subject: "Update from Reel Addiction III Dashboard",
      html,
    });

    return NextResponse.json({ ok: true, sent_to: emails.length, sendResp });
  } catch (err: any) {
    console.error("notify-progress error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "notify-progress endpoint is alive ✅" });
}
