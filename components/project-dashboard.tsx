"use client"
import SubscribeForm from "../components/SubscribeForm"
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
    <div className="p-4 grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Overall Progress */}
      <Card className="col-span-1 md:col-span-2">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-lg md:text-xl font-semibold">Overall Progress</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {overall.done} of {overall.total} tasks complete
            </p>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={30}
                  outerRadius={50}
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

      {/* Notifications + Subscribe */}
      <div className="rounded-xl border bg-white p-4 md:p-6 shadow space-y-4">
        <h2 className="text-lg font-bold">Team Notifications</h2>
        <p className="text-sm text-gray-600">
          Subscribe with your email to get notified when this website overhaul checklist changes.  
          For internal use only.
        </p>
        <SubscribeForm />
      </div>

      {/* Section Progress */}
      {sections.map((section) => {
        const sectionTasks = tasks.filter((t) => t.phase === section)
        const done = sectionTasks.filter((t) => t.status === "Done").length
        const percent = Math.round((done / sectionTasks.length) * 100) || 0

        return (
          <Card key={section}>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-md md:text-lg font-semibold mb-2">{section}</h3>
              <Progress value={percent} className="h-2 mb-4" />
              <ul className="space-y-3">
                {sectionTasks.map((t, i) => (
                  <li key={i}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-sm md:text-base">{t.task}</span>
                      <span
                        className={`mt-1 sm:mt-0 px-2 py-1 rounded text-xs font-medium self-start sm:self-auto ${
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
