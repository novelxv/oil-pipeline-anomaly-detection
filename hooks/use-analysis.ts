"use client"

import { useState, useCallback } from "react"
import { apiClient, type AnalysisStatus, type AnalysisConfig } from "@/lib/api"

export function useAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>({
    status: "idle",
    progress: 0,
    current_step: "",
  })
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const pollStatus = useCallback(async () => {
    try {
      const statusData = await apiClient.getAnalysisStatus()
      setStatus(statusData)

      if (statusData.status === "completed" && statusData.results) {
        setResults(statusData.results)
      } else if (statusData.status === "error") {
        setError(statusData.error || "Analysis failed")
      }
    } catch (err) {
      console.error("Failed to poll status:", err)
    }
  }, [])

  const startAnalysis = useCallback(
    async (config: AnalysisConfig = {}) => {
      try {
        setError(null)
        setResults(null)

        await apiClient.startAnalysis(config)

        // Start polling for status updates
        const pollInterval = setInterval(async () => {
          await pollStatus()

          // Stop polling when analysis is complete or failed
          const currentStatus = await apiClient.getAnalysisStatus()
          if (currentStatus.status === "completed" || currentStatus.status === "error") {
            clearInterval(pollInterval)
          }
        }, 1000) // Poll every second

        return () => clearInterval(pollInterval)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start analysis")
      }
    },
    [pollStatus],
  )

  const resetAnalysis = useCallback(() => {
    setStatus({
      status: "idle",
      progress: 0,
      current_step: "",
    })
    setResults(null)
    setError(null)
  }, [])

  return {
    status,
    results,
    error,
    startAnalysis,
    resetAnalysis,
    pollStatus,
  }
}
