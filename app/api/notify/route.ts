import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Load environment variables
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID
    const range = process.env.GOOGLE_SHEETS_RANGE
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!spreadsheetId || !range || !clientEmail || !privateKey) {
      throw new Error("Missing required Google Sheets environment variables")
    }

    // Auth with Google
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch the data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range, // <-- now uses GOOGLE_SHEETS_RANGE
    })

    const rows = res.data.values || []

    return NextResponse.json({ rows })
  } catch (error) {
    console.error("Notify error:", error)
    return NextResponse.json({ error: "Failed to fetch sheet data" }, { status: 500 })
  }
}
