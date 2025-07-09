"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Play, Brain, Zap, Target, AlertTriangle, CheckCircle } from "lucide-react"
import { useAnalysis } from "@/hooks/use-analysis"

interface DetectionResult {
  step: string
  status: "pending" | "running" | "completed"
  progress: number
  results?: any
}

export default function AnomalyDetector() {
  const { status, results, error, startAnalysis } = useAnalysis()

  const runDetection = async () => {
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

  // Map API status to display steps
  const getDetectionSteps = () => {
    const steps = [
      { step: "Data Preprocessing", status: "pending", progress: 0 },
      { step: "One-Class SVM Training", status: "pending", progress: 0 },
      { step: "Anomaly Detection", status: "pending", progress: 0 },
      { step: "Hierarchical Clustering", status: "pending", progress: 0 },
      { step: "Multi-source Analysis", status: "pending", progress: 0 },
    ]

    if (status.status === "running") {
      const currentStepIndex = steps.findIndex((s) => s.step.includes(status.current_step.split(" ")[0]))

      steps.forEach((step, index) => {
        if (index < currentStepIndex) {
          step.status = "completed"
          step.progress = 100
        } else if (index === currentStepIndex) {
          step.status = "running"
          step.progress = status.progress
        }
      })
    } else if (status.status === "completed") {
      steps.forEach((step) => {
        step.status = "completed"
        step.progress = 100
      })
    }

    return steps
  }

  const detectionSteps = getDetectionSteps()

  // Generate sample clustering data for visualization
  const clusteringData = Array.from({ length: 200 }, (_, i) => ({
    x: Math.random() * 10,
    y: Math.random() * 10,
    cluster: Math.floor(Math.random() * 10),
    isLeak: Math.random() < 0.06, // 6% chance of being a leak
  }))

  const getStepIcon = (step: DetectionResult) => {
    if (step.status === "completed") return <CheckCircle className="w-5 h-5 text-green-500" />
    if (step.status === "running") return <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
    return <Brain className="w-5 h-5 text-gray-400" />
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
            <Target className="w-5 h-5" />
            Anomaly Detection Pipeline
          </CardTitle>
          <CardDescription>Multi-stage machine learning pipeline for identifying true leak anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {status.status === "running"
                ? `Processing step ${detectionSteps.findIndex((s) => s.status === "running") + 1} of ${detectionSteps.length}`
                : "Ready to start detection"}
            </div>
            <Button onClick={runDetection} disabled={status.status === "running"}>
              <Play className="w-4 h-4 mr-2" />
              {status.status === "running" ? "Processing..." : "Start Detection"}
            </Button>
          </div>

          <div className="space-y-4">
            {detectionSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <span className="font-medium">{step.step}</span>
                    <Badge
                      variant={
                        step.status === "completed" ? "default" : step.status === "running" ? "secondary" : "outline"
                      }
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">{step.progress}%</span>
                </div>

                <Progress value={step.progress} className="mb-2" />

                {step.results && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    {step.step === "One-Class SVM Training" && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>Normal Samples: {step.results.normalSamples.toLocaleString()}</div>
                        <div>Suspected Anomalies: {step.results.suspectedAnomalies.toLocaleString()}</div>
                        <div>SVM Accuracy: {(step.results.svmAccuracy * 100).toFixed(1)}%</div>
                      </div>
                    )}
                    {step.step === "Hierarchical Clustering" && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>Clusters Found: {step.results.clusters}</div>
                        <div>Leak Cluster ID: {step.results.leakCluster}</div>
                        <div>False Anomalies Filtered: {step.results.falseAnomaliesFiltered.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {status.status === "completed" && results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Detection completed successfully! {results.true_anomalies} true leak anomalies identified with{" "}
                {results.false_positive_reduction}% false positive reduction.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.total_processed.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Samples</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.true_anomalies}</div>
                <div className="text-sm text-gray-600">True Anomalies</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{(results.recall * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Recall Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.false_positive_reduction}%</div>
                <div className="text-sm text-gray-600">False Positive Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="svm" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="svm">One-Class SVM</TabsTrigger>
          <TabsTrigger value="clustering">Hierarchical Clustering</TabsTrigger>
          <TabsTrigger value="multisource">Multi-source Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="svm">
          <Card>
            <CardHeader>
              <CardTitle>One-Class SVM Results</CardTitle>
              <CardDescription>Support Vector Machine trained on normal pipeline operation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Model Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Kernel:</span>
                      <Badge variant="outline">RBF</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Nu Parameter:</span>
                      <Badge variant="outline">0.05</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Gamma:</span>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Samples:</span>
                      <Badge variant="outline">18.24M</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Precision:</span>
                      <Badge variant="outline">91.0%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Recall:</span>
                      <Badge variant="outline">88.0%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>F1-Score:</span>
                      <Badge variant="outline">89.4%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Time:</span>
                      <Badge variant="outline">45 seconds</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clustering">
          <Card>
            <CardHeader>
              <CardTitle>Hierarchical Clustering Analysis</CardTitle>
              <CardDescription>
                Pattern recognition to distinguish leak anomalies from operational anomalies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={clusteringData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Feature 1" />
                    <YAxis dataKey="y" name="Feature 2" />
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      labelFormatter={() => ""}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p>Cluster: {data.cluster}</p>
                              <p>Type: {data.isLeak ? "Leak Anomaly" : "Operational Anomaly"}</p>
                              <p>Feature 1: {data.x.toFixed(2)}</p>
                              <p>Feature 2: {data.y.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="y">
                      {clusteringData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isLeak ? "#dc2626" : `hsl(${entry.cluster * 36}, 70%, 50%)`}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold">10</div>
                  <div className="text-sm text-gray-600">Clusters Found</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">1</div>
                  <div className="text-sm text-gray-600">Leak Cluster</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">9</div>
                  <div className="text-sm text-gray-600">Operational Clusters</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">79.6%</div>
                  <div className="text-sm text-gray-600">False Positives Removed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multisource">
          <Card>
            <CardHeader>
              <CardTitle>Multi-source Data Analysis</CardTitle>
              <CardDescription>
                Joint analysis of pressure and pump frequency data to eliminate false positives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Correlation Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Pressure-Frequency Correlation:</span>
                        <Badge variant="outline">0.73</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Operational Events Identified:</span>
                        <Badge variant="outline">147</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance Threshold:</span>
                        <Badge variant="outline">0.1</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Final Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Additional False Positives Removed:</span>
                        <Badge variant="outline">3.95%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total False Positive Reduction:</span>
                        <Badge variant="outline">83.49%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Leak Detection Recall:</span>
                        <Badge variant="outline">100%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Multi-source analysis successfully eliminated operational anomalies while preserving all true leak
                    events. The system achieved 100% recall for leak detection with 83.49% false positive reduction.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
