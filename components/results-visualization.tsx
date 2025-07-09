"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Target, Shield, Clock } from "lucide-react"

interface ResultsProps {
  results: any
}

export default function ResultsVisualization({ results }: ResultsProps) {
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Run the analysis to see detailed results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">No results available. Please run the analysis first.</div>
        </CardContent>
      </Card>
    )
  }

  const performanceData = [
    { metric: "Precision", value: results.precision * 100, target: 90 },
    { metric: "Recall", value: results.recall * 100, target: 95 },
    { metric: "F1-Score", value: results.f1Score * 100, target: 92 },
    { metric: "False Positive Reduction", value: results.falseAnomalyExclusionRate, target: 80 },
  ]

  const distributionData = [
    { name: "Normal Samples", value: results.normalSamples, color: "#22c55e" },
    { name: "True Anomalies", value: results.trueAnomalies, color: "#dc2626" },
    { name: "False Anomalies (Filtered)", value: results.falseAnomalies, color: "#f59e0b" },
  ]

  const comparisonData = [
    { method: "Traditional SVM", precision: 75, recall: 82, f1: 78 },
    { method: "Neural Network", precision: 78, recall: 85, f1: 81 },
    { method: "Random Forest", precision: 80, recall: 79, f1: 79 },
    {
      method: "Our Method",
      precision: results.precision * 100,
      recall: results.recall * 100,
      f1: results.f1Score * 100,
    },
  ]

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    anomalies: Math.floor(Math.random() * 5) + (i === 14 ? 8 : 0), // Spike at hour 14
    falsePositives: Math.floor(Math.random() * 15) + 5,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leak Detection Recall</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">All leak events detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Reduction</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{results.falseAnomalyExclusionRate}%</div>
            <p className="text-xs text-muted-foreground">Operational anomalies filtered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{"<3 min"}</div>
            <p className="text-xs text-muted-foreground">Real-time response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(results.totalSamples / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Samples analyzed</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Model performance compared to target benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Performance"]} />
                <Bar dataKey="value" fill="#3b82f6" />
                <Bar dataKey="target" fill="#e5e7eb" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Achieved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-sm">Target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Data Distribution</CardTitle>
            <CardDescription>Breakdown of sample types in the dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Samples"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Method Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Method Comparison</CardTitle>
            <CardDescription>Performance comparison with other approaches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="method" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="precision" fill="#3b82f6" name="Precision" />
                  <Bar dataKey="recall" fill="#10b981" name="Recall" />
                  <Bar dataKey="f1" fill="#f59e0b" name="F1-Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Anomaly Detection Timeline</CardTitle>
          <CardDescription>Anomaly detection results over a 24-hour period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Hour: ${value}:00`}
                  formatter={(value, name) => [
                    value,
                    name === "anomalies" ? "True Anomalies" : "False Positives (Before Filtering)",
                  ]}
                />
                <Line type="monotone" dataKey="anomalies" stroke="#dc2626" strokeWidth={2} name="True Anomalies" />
                <Line
                  type="monotone"
                  dataKey="falsePositives"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="False Positives"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-sm">True Anomalies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm">False Positives (Before Filtering)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis Results</CardTitle>
          <CardDescription>Comprehensive breakdown of the detection pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Stage 1: One-Class SVM</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Normal Samples Identified:</span>
                    <Badge variant="outline">{results.normalSamples.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Suspected Anomalies:</span>
                    <Badge variant="outline">{results.anomalies.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SVM Accuracy:</span>
                    <Badge variant="outline">{(results.precision * 100).toFixed(1)}%</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Stage 2: Hierarchical Clustering</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Clusters Identified:</span>
                    <Badge variant="outline">10</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Leak Pattern Cluster:</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">False Positives Removed:</span>
                    <Badge variant="outline">79.6%</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Stage 3: Multi-source Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pump Frequency Correlation:</span>
                    <Badge variant="outline">0.73</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Additional FP Reduction:</span>
                    <Badge variant="outline">3.95%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Final Leak Recall:</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">Key Achievements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">100% recall rate for leak anomaly identification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">83.49% false anomaly exclusion rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Real-time processing capability ({"<3 minutes"})</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Suitable for complex production environments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Minimum leak detectable rate: 0.43 g/24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Effective for legacy monitoring equipment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
