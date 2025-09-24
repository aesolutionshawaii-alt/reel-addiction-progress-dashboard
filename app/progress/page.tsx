export const dynamic = "force-dynamic"

import ProjectDashboard from "@/components/project-dashboard"

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reel Addiction III</h1>
          <p className="text-gray-600 mt-2">Project Progress Dashboard</p>
        </div>
        <ProjectDashboard />
      </div>
    </div>
  )
}
