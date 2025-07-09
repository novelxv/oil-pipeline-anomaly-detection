"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, RefreshCw, Database, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PipelineData {
  time: number
  pressure: number
  frequency: number
  isAnomaly: boolean
  anomalyType: "normal" | "leak" | "operational"
}

export default function DataGenerator() {
  const [data, setData] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState({
    duration: 24, // hours
    samplingRate: 2, // seconds
    numPipelines: 19,
    leakEvents: 12,
    operationalEvents: 150,
  })

  const generatePipelineData = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await apiClient.generateData({
        duration: config.duration,
        samplingRate: config.samplingRate,
        numPipelines: config.numPipelines,
        leakEvents: config.leakEvents,
        operationalEvents: config.operationalEvents,
      })

      if (response.success) {
        setData(response.data)
        console.log("Data generation completed:", response.statistics)
      } else {
        setError("Failed to generate data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate data")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadData = async () => {
    try {
      const blob = await apiClient.downloadData()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "pipeline_data.csv"
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download data")
    }
  }

  useEffect(() => {
    generatePipelineData()
  }, [])

  const stats = {
    total: data.length,
    normal: data.filter((d) => d.anomaly_type === "normal").length,
    leaks: data.filter((d) => d.anomaly_type === "leak").length,
    operational: data.filter((d) => d.anomaly_type === "operational").length,
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Pipeline Data Generation
          </CardTitle>
          <CardDescription>
            Generate synthetic oil pipeline monitoring data with realistic anomaly patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="samplingRate">Sampling Rate (s)</Label>
              <Input
                id="samplingRate"
                type="number"
                value={config.samplingRate}
                onChange={(e) => setConfig({ ...config, samplingRate: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="numPipelines">Pipelines</Label>
              <Input
                id="numPipelines"
                type="number"
                value={config.numPipelines}
                onChange={(e) => setConfig({ ...config, numPipelines: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="leakEvents">Leak Events</Label>
              <Input
                id="leakEvents"
                type="number"
                value={config.leakEvents}
                onChange={(e) => setConfig({ ...config, leakEvents: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="operationalEvents">Operational Events</Label>
              <Input
                id="operationalEvents"
                type="number"
                value={config.operationalEvents}
                onChange={(e) => setConfig({ ...config, operationalEvents: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={generatePipelineData} disabled={isGenerating}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Generate Data"}
            </Button>
            <Button variant="outline" onClick={downloadData} disabled={data.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Samples</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.normal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Normal</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.leaks}</div>
              <div className="text-sm text-gray-600">Leak Events</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.operational}</div>
              <div className="text-sm text-gray-600">Operational</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pressure Monitoring Data</CardTitle>
            <CardDescription>Pipeline pressure over time with anomaly markers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(value) => `${Math.floor(value / 3600)}h`} />
                  <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                  <Tooltip
                    labelFormatter={(value) =>
                      `Time: ${Math.floor(Number(value) / 3600)}h ${Math.floor((Number(value) % 3600) / 60)}m`
                    }
                    formatter={(value: any, name) => [
                      name === "pressure" ? `${Number(value).toFixed(3)} MPa` : value,
                      name === "pressure" ? "Pressure" : name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="#2563eb"
                    strokeWidth={1}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props
                      if (payload.anomaly_type === "leak") {
                        return <circle cx={cx} cy={cy} r={2} fill="#dc2626" />
                      } else if (payload.anomaly_type === "operational") {
                        return <circle cx={cx} cy={cy} r={1} fill="#f59e0b" />
                      }
                      return null
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Normal Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Leak Anomaly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Operational Anomaly</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pump Frequency Data</CardTitle>
            <CardDescription>Oil pump frequency variations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(value) => `${Math.floor(value / 3600)}h`} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    labelFormatter={(value) =>
                      `Time: ${Math.floor(Number(value) / 3600)}h ${Math.floor((Number(value) % 3600) / 60)}m`
                    }
                    formatter={(value: any) => [`${Number(value).toFixed(1)} Hz`, "Frequency"]}
                  />
                  <Line type="monotone" dataKey="frequency" stroke="#16a34a" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
