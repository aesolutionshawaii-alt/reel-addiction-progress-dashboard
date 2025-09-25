import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ ok: false, error: "No email provided" }, { status: 400 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    // Append to Subscribers tab: [Email, DateSubscribed]
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Subscribers!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[email, new Date().toISOString()]] },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Subscribe API error:", error)
    return NextResponse.json({ ok: false, error: "Failed to subscribe" }, { status: 500 })
  }
}
