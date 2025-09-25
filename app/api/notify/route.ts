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
  return diffs.length ? diffs.join("\n") : "Updated, but no row-level differences detected.";
}

export async function GET() {
  try {
    // --- Env ---
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
    const range = process.env.GOOGLE_SHEETS_RANGE!; // e.g., "Progress!A:D"
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const resendKey = process.env.RESEND_API_KEY || "";

    if (!spreadsheetId || !range || !clientEmail || !privateKey) {
      throw new Error("Missing required env vars for Google Sheets.");
    }

    // Derive columns "A:D" from "Tab!A:D"
    const parts = range.split("!");
    const currentTab = parts[0];
    const cols = parts[1] || "A:Z";
    const snapshotTab = "LastSnapshot";
    const snapshotRange = `${snapshotTab}!${cols}`;

    // --- Auth ---
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // Ensure LastSnapshot sheet exists; if not, create it.
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const titles = sheetMeta.data.sheets?.map(s => s.properties?.title) || [];
    if (!titles.includes(snapshotTab)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: snapshotTab } } }] },
      });
    }

    // --- Load subscribers ---
    const subsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Subscribers!A:A",
    });
    const subscribers = (subsRes.data.values || []).flat().filter(Boolean) as string[];

    // --- Load current + snapshot ---
    const currentRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range, // e.g., Progress!A:D
    });
    const current = currentRes.data.values || [];

    let snapshot: string[][] = [];
    try {
      const snapRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: snapshotRange,
      });
      snapshot = snapRes.data.values || [];
    } catch {
      snapshot = [];
    }

    // First run: seed snapshot and exit
    if (!snapshot.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${snapshotTab}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: current },
      });
      return NextResponse.json({ ok: true, message: "Seeded LastSnapshot (first run). No emails sent." });
    }

    // Compare
    const changed = JSON.stringify(current) !== JSON.stringify(snapshot);
    if (!changed) {
      return NextResponse.json({ ok: true, message: "No changes." });
    }

    // Build diff HTML
    const diffHtml = makeDiff(snapshot, current);

    // Send email (only if there are subscribers)
    if (subscribers.length && resendKey) {
      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Reel Addiction III <updates@yourdomain.com>",
          to: subscribers,
          subject: "Website Project Checklist Updated",
          html: `<p>Aloha,</p>
                 <p>The internal website overhaul checklist has changed (tab: <b>${currentTab}</b>).</p>
                 <hr/>
                 <div style="font-family:monospace">${diffHtml}</div>
                 <p>– Reel Addiction III Crew</p>`,
        }),
      });
      if (!sendRes.ok) {
        console.error("Resend error:", await sendRes.text());
      }
    }

    // Update snapshot
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: snapshotRange });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${snapshotTab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: current },
    });

    return NextResponse.json({
      ok: true,
      message: `Changes detected — notified ${subscribers.length} subscriber(s).`,
    });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

