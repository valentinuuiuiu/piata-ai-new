'use client'

import { useState, useEffect } from 'react'

interface Workflow {
  id: string
  name: string
  description: string
  enabled: boolean
  stepCount: number
  schedule: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows')
      const data = await res.json()
      if (data.success) {
        setWorkflows(data.workflows)
      }
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowId: string) => {
    setExecuting(workflowId)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [workflowId]: data }))
      alert(data.message)
    } catch (error: any) {
      alert('Workflow execution failed: ' + error.message)
    } finally {
      setExecuting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">Autonomous Workflows</h1>
        <p className="text-lg opacity-90">
          Ori suntem golani ori nu mai suntem - Self-executing AI workflows
        </p>
        <p className="text-sm opacity-75 mt-2">
          {workflows.length} workflows available • {workflows.filter(w => w.enabled).length} enabled
        </p>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map(workflow => {
          const lastResult = results[workflow.id]
          return (
            <div
              key={workflow.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  workflow.enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.enabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📋 Steps: {workflow.stepCount}</p>
                <p>⏰ Schedule: {workflow.schedule === 'manual' ? 'Manual trigger' : workflow.schedule}</p>
                <p>🆔 ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{workflow.id}</code></p>
              </div>

              {lastResult && (
                <div className={`p-4 rounded-lg mb-4 ${
                  lastResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-semibold mb-2 ${
                    lastResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastResult.success ? '✅ Success' : '❌ Failed'}
                  </p>
                  <p className="text-sm text-gray-700">
                    Completed: {lastResult.completedSteps}/{workflow.stepCount} steps
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Execution time: {lastResult.executionTime}ms
                  </p>
                </div>
              )}

              <button
                onClick={() => executeWorkflow(workflow.id)}
                disabled={!workflow.enabled || executing === workflow.id}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {executing === workflow.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    ▶️ Execute Workflow
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 className="font-bold text-blue-900 mb-2">How Workflows Work</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each workflow consists of multiple AI agent steps</li>
          <li>• Steps execute in dependency order automatically</li>
          <li>• Failed steps are retried automatically</li>
          <li>• All executions are logged for learning</li>
          <li>• Scheduled workflows run via cron (coming soon)</li>
        </ul>
      </div>
    </div>
  )
}
