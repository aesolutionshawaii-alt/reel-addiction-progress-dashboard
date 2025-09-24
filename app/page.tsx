export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Reel Addiction III</h1>
        <p className="text-gray-600 mb-6">Welcome to the Reel Addiction III web redesign project.</p>
        <a
          href="/progress"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Progress
        </a>
      </div>
    </div>
  )
}
