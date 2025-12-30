'use client'

import { useState } from 'react'
import React from 'react'

export default function TasksPage() {
    const [task, setTask] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/kan/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: task })
            })
            const data = await res.json()
            setResult(data)
        } catch (error: any) {
            setResult({ success: false, error: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-cyan-900 text-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-2">Task Ingestion & Tool Creation</h1>
                <p className="text-lg opacity-90">
                    "Speak, and it shall be built." - KAEL Tool Generative Interface
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Natural Language Task Description
                        </label>
                        <textarea
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500"
                            placeholder="Example: Search for iPhone 13 prices on OLX every hour and save them to a CSV file..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !task}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Analyzing & Generating Tool...' : '🚀 Generate Tool Agent'}
                    </button>
                </form>
            </div>

            {result && (
                <div className={`p-6 rounded-lg shadow-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? '✅ Tool Created Successfully' : '❌ Creation Failed'}
                    </h3>

                    {result.success && (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded border border-green-200">
                                <p className="font-semibold text-gray-700">Tool Path:</p>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1">{result.toolPath}</code>
                            </div>

                            <div className="bg-white p-4 rounded border border-green-200">
                                <p className="font-semibold text-gray-700">Generated Code:</p>
                                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                                    {result.code}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                <p className="text-blue-800 font-semibold">Next Steps:</p>
                                <p className="text-blue-700 text-sm">The tool has been saved. You can now register it as a repeatable workflow or execute it directly.</p>
                            </div>
                        </div>
                    )}

                    {!result.success && (
                        <p className="text-red-600">{result.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
