import { fetchProgressRows } from "@/lib/googleSheets"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const rows = await fetchProgressRows()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching progress data:", error)
    return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 })
  }
}
