"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Play, BarChart3, Settings, Database } from "lucide-react"
import DataGenerator from "@/components/data-generator"
import AnomalyDetector from "@/components/anomaly-detector"
import ResultsVisualization from "@/components/results-visualization"
import ModelConfiguration from "@/components/model-configuration"
import { useAnalysis } from "@/hooks/use-analysis"

export default function OilPipelineAnomalyDetection() {
  const [activeTab, setActiveTab] = useState("overview")
  const { status, results, error, startAnalysis, resetAnalysis } = useAnalysis()

  const handleRunAnalysis = async () => {
    await startAnalysis({
      kernel: "rbf",
      nu: 0.05,
      gamma: "auto",
      window_size: 400,
      n_clusters: 10,
      linkage: "ward",
      variance_threshold: 0.1,
      correlation_threshold: 0.7,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Oil Pipeline Anomaly Detection System</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced machine learning system for distinguishing true leak anomalies from false operational anomalies in
            oil pipeline monitoring
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Database className="w-4 h-4 mr-1" />
              22.8M Records
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <BarChart3 className="w-4 h-4 mr-1" />
              One-Class SVM
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Settings className="w-4 h-4 mr-1" />
              Hierarchical Clustering
            </Badge>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status.status === "idle" && <Play className="w-5 h-5" />}
              {status.status === "running" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {status.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
              {status.status === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {status.status === "idle" && "Ready to analyze pipeline data"}
                  {status.status === "running" && `Processing: ${status.current_step}`}
                  {status.status === "completed" && "Analysis completed successfully"}
                  {status.status === "error" && `Error: ${error}`}
                </span>
                <div className="flex gap-2">
                  <Button onClick={handleRunAnalysis} disabled={status.status === "running"}>
                    {status.status === "running" ? "Processing..." : "Run Analysis"}
                  </Button>
                  {status.status !== "idle" && (
                    <Button variant="outline" onClick={resetAnalysis}>
                      Reset
                    </Button>
                  )}
                </div>
              </div>
              {status.status === "running" && <Progress value={status.progress} className="w-full" />}
              {results && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analysis completed: {results.trueAnomalies} true anomalies detected with{" "}
                    {results.falseAnomalyExclusionRate.toFixed(2)}% false anomaly exclusion rate
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data Generation</TabsTrigger>
            <TabsTrigger value="detection">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">One-Class SVM for anomaly detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Hierarchical clustering for pattern recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Multi-source data fusion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Real-time monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">False positive reduction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Production environment ready</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Leak Recall Rate</span>
                      <Badge variant="outline">100%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">False Anomaly Exclusion</span>
                      <Badge variant="outline">83.49%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="outline">{"<3 min"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>Three-layer approach for distinguishing true and false anomalies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Layer 1: Data Preprocessing</h3>
                    <p className="text-sm text-gray-600">Time series preprocessing with sliding window method</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Layer 2: Anomaly Detection</h3>
                    <p className="text-sm text-gray-600">One-Class SVM for normal/abnormal classification</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Layer 3: Pattern Recognition</h3>
                    <p className="text-sm text-gray-600">Hierarchical clustering and multi-source analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <DataGenerator />
          </TabsContent>

          <TabsContent value="detection">
            <AnomalyDetector />
          </TabsContent>

          <TabsContent value="results">
            <ResultsVisualization results={results} />
          </TabsContent>

          <TabsContent value="config">
            <ModelConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
