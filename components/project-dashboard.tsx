"use client"
import SendAlertsButton from "./SendAlertsButton"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { TaskRow } from "@/lib/googleSheets"
import { useEffect, useState } from "react"

const statusColors = {
  Done: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Not Started": "bg-gray-200 text-gray-700",
  blocked: "bg-red-100 text-red-800",
}

export default function ProjectDashboard() {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetch("/api/progress")
        const rows = await data.json()
        setTasks(rows)
      } catch (error) {
        console.error("Failed to load progress data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="p-6 text-center">Loading progress data...</div>
  }

  const sections = [...new Set(tasks.map((t) => t.phase))]

  const overall = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "Done").length,
  }

  const data = [
    { name: "Done", value: overall.done },
    { name: "Remaining", value: overall.total - overall.done }
  ]

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      {/* Overall Progress */}
      <Card className="col-span-2">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-semibold">Overall Progress</h2>
            <p className="text-sm text-gray-600">
              {overall.done} of {overall.total} tasks complete
            </p>
          </div>
          <div className="w-32 h-32">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Team Notifications */}
      <div className="rounded-xl border bg-white p-6 shadow">
        <h2 className="text-lg font-bold mb-2">Team Notifications</h2>
        <SendAlertsButton />
      </div>

      {/* Section Progress */}
      {sections.map((section) => {
        const sectionTasks = tasks.filter((t) => t.phase === section)
        const done = sectionTasks.filter((t) => t.status === "Done").length
        const percent = Math.round((done / sectionTasks.length) * 100) || 0

        return (
          <Card key={section}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{section}</h3>
              <Progress value={percent} className="h-2 mb-4" />
              <ul className="space-y-3">
                {sectionTasks.map((t, i) => (
                  <li key={i}>
                    <div className="flex justify-between items-center">
                      <span>{t.task}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[t.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    {t.notes && (
                      <p className="text-xs text-gray-500 mt-1">{t.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
