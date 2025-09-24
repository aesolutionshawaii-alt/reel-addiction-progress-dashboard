import { google } from "googleapis"

export type TaskRow = {
  phase: string
  task: string
  status: "Not Started" | "In Progress" | "Done"
  notes?: string
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

function getJwt() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string
  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
  }
  // Vercel/Env often stores newlines as \n — convert to real newlines
  privateKey = privateKey.replace(/\\n/g, "\n")
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })
}

export async function fetchProgressRows(): Promise<TaskRow[]> {
  try {
    const sheets = google.sheets({ version: "v4", auth: getJwt() })
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID as string // e.g. 1AbC... from the Sheet URL
    const range = process.env.GOOGLE_SHEETS_RANGE || "Progress!A2:D" // Columns: Phase | Task | Status | Notes
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_ID")

    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: String(range) })
    const values = data.values || []

    if (values.length === 0) {
      return []
    }

    const rows: TaskRow[] = values
      .filter((r) => r.length >= 3)
      .map((r) => ({
        phase: String(r[0] || "").trim(),
        task: String(r[1] || "").trim(),
        status: (String(r[2] || "").trim() || "Not Started") as TaskRow["status"],
        notes: r[3] ? String(r[3]).trim() : undefined,
      }))

    return rows
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error)
    return []
  }
}

export async function computeStats(rows: TaskRow[]) {
  const total = rows.length
  const done = rows.filter((r) => r.status === "Done").length
  const inProgress = rows.filter((r) => r.status === "In Progress").length
  const notStarted = total - done - inProgress
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, inProgress, notStarted, percent }
}

// Optional: get distinct phases in sorted order
export function phasesFrom(rows: TaskRow[]) {
  const set = new Set(rows.map((r) => r.phase))
  return Array.from(set).filter(Boolean)
}
