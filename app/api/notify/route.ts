import { google } from "googleapis";
import { NextResponse } from "next/server";

function makeDiff(oldData: string[][], newData: string[][]): string {
  const diffs: string[] = [];
  const maxRows = Math.max(oldData.length, newData.length);

  for (let i = 0; i < maxRows; i++) {
    const oldRow = oldData[i] || [];
    const newRow = newData[i] || [];

    if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) {
      diffs.push(
        `Row ${i + 1}:<br>Before → ${oldRow.join(" | ") || "(empty)"}<br>After → ${newRow.join(" | ") || "(empty)"}<br><br>`
      );
    }
  }

  return diffs.length > 0
    ? diffs.join("\n")
    : "Checklist updated, but no row-level differences detected.";
}

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
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

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
      range: "Checklist!A:Z", // adjust name if needed
    });
    const checklist = checklistRes.data.values || [];
