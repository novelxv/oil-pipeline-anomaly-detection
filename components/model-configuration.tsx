"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Brain, Layers, Zap, Info, Save, RotateCcw } from "lucide-react"

export default function ModelConfiguration() {
  const [ocsvmConfig, setOcsvmConfig] = useState({
    kernel: "rbf",
    nu: 0.05,
    gamma: "auto",
    convergenceAccuracy: 0.001,
    maxIterations: 1000,
  })

  const [clusteringConfig, setClusteringConfig] = useState({
    numClusters: 10,
    linkage: "ward",
    distanceMetric: "euclidean",
    leafNodes: 3,
  })

  const [preprocessingConfig, setPreprocessingConfig] = useState({
    windowSize: 400,
    samplingRate: 2,
    normalization: true,
    outlierRemoval: true,
    interpolationMethod: "linear",
  })

  const [multisourceConfig, setMultisourceConfig] = useState({
    enableFrequencyAnalysis: true,
    varianceThreshold: 0.1,
    correlationThreshold: 0.7,
    timeAlignment: true,
  })

  const resetToDefaults = () => {
    setOcsvmConfig({
      kernel: "rbf",
      nu: 0.05,
      gamma: "auto",
      convergenceAccuracy: 0.001,
      maxIterations: 1000,
    })
    setClusteringConfig({
      numClusters: 10,
      linkage: "ward",
      distanceMetric: "euclidean",
      leafNodes: 3,
    })
    setPreprocessingConfig({
      windowSize: 400,
      samplingRate: 2,
      normalization: true,
      outlierRemoval: true,
      interpolationMethod: "linear",
    })
    setMultisourceConfig({
      enableFrequencyAnalysis: true,
      varianceThreshold: 0.1,
      correlationThreshold: 0.7,
      timeAlignment: true,
    })
  }

  const saveConfiguration = () => {
    const config = {
      ocsvm: ocsvmConfig,
      clustering: clusteringConfig,
      preprocessing: preprocessingConfig,
      multisource: multisourceConfig,
    }

    // In a real application, this would save to a backend
    localStorage.setItem("pipelineAnomalyConfig", JSON.stringify(config))

    // Show success message (in a real app, you'd use a toast notification)
    alert("Configuration saved successfully!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Model Configuration
          </CardTitle>
          <CardDescription>Configure parameters for the oil pipeline anomaly detection system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={saveConfiguration}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Based on sensitivity analysis, the number of clusters is the most critical parameter. Window size and
              convergence accuracy have moderate impact on performance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="ocsvm" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ocsvm">One-Class SVM</TabsTrigger>
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="preprocessing">Preprocessing</TabsTrigger>
          <TabsTrigger value="multisource">Multi-source</TabsTrigger>
        </TabsList>

        <TabsContent value="ocsvm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                One-Class SVM Configuration
              </CardTitle>
              <CardDescription>Configure the support vector machine for anomaly detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="kernel">Kernel Function</Label>
                    <Select
                      value={ocsvmConfig.kernel}
                      onValueChange={(value) => setOcsvmConfig({ ...ocsvmConfig, kernel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rbf">RBF (Radial Basis Function)</SelectItem>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="poly">Polynomial</SelectItem>
                        <SelectItem value="sigmoid">Sigmoid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nu">Nu Parameter</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[ocsvmConfig.nu]}
                        onValueChange={(value) => setOcsvmConfig({ ...ocsvmConfig, nu: value[0] })}
                        max={0.5}
                        min={0.01}
                        step={0.01}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0.01</span>
                        <Badge variant="outline">{ocsvmConfig.nu}</Badge>
                        <span>0.5</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gamma">Gamma</Label>
                    <Select
                      value={ocsvmConfig.gamma}
                      onValueChange={(value) => setOcsvmConfig({ ...ocsvmConfig, gamma: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                        <SelectItem value="0.001">0.001</SelectItem>
                        <SelectItem value="0.01">0.01</SelectItem>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="convergenceAccuracy">Convergence Accuracy</Label>
                    <Select
                      value={ocsvmConfig.convergenceAccuracy.toString()}
                      onValueChange={(value) =>
                        setOcsvmConfig({ ...ocsvmConfig, convergenceAccuracy: Number.parseFloat(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="0.01">0.01</SelectItem>
                        <SelectItem value="0.001">0.001</SelectItem>
                        <SelectItem value="0.0001">0.0001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxIterations">Max Iterations</Label>
                    <Input
                      id="maxIterations"
                      type="number"
                      value={ocsvmConfig.maxIterations}
                      onChange={(e) =>
                        setOcsvmConfig({ ...ocsvmConfig, maxIterations: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Parameter Impact</h4>
                    <div className="space-y-1 text-xs">
                      <div>• Nu: Controls the fraction of outliers (lower = stricter)</div>
                      <div>• Gamma: Kernel coefficient (auto recommended)</div>
                      <div>• Convergence: Training precision (0.001 optimal)</div>
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
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Hierarchical Clustering Configuration
              </CardTitle>
              <CardDescription>Configure clustering parameters for anomaly pattern recognition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="numClusters">Number of Clusters</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[clusteringConfig.numClusters]}
                        onValueChange={(value) => setClusteringConfig({ ...clusteringConfig, numClusters: value[0] })}
                        max={25}
                        min={5}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>5</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {clusteringConfig.numClusters} (High Sensitivity)
                        </Badge>
                        <span>25</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="linkage">Linkage Method</Label>
                    <Select
                      value={clusteringConfig.linkage}
                      onValueChange={(value) => setClusteringConfig({ ...clusteringConfig, linkage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ward">Ward</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="distanceMetric">Distance Metric</Label>
                    <Select
                      value={clusteringConfig.distanceMetric}
                      onValueChange={(value) => setClusteringConfig({ ...clusteringConfig, distanceMetric: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="euclidean">Euclidean</SelectItem>
                        <SelectItem value="manhattan">Manhattan</SelectItem>
                        <SelectItem value="cosine">Cosine</SelectItem>
                        <SelectItem value="correlation">Correlation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leafNodes">Leaf Nodes</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[clusteringConfig.leafNodes]}
                        onValueChange={(value) => setClusteringConfig({ ...clusteringConfig, leafNodes: value[0] })}
                        max={6}
                        min={2}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>2</span>
                        <Badge variant="outline">{clusteringConfig.leafNodes}</Badge>
                        <span>6</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Clustering Guidelines</h4>
                    <div className="space-y-1 text-xs">
                      <div>• Optimal clusters: 10 (based on research results)</div>
                      <div>• Ward linkage works best for pressure data</div>
                      <div>• Euclidean distance recommended for time series</div>
                      <div>• Leaf nodes: 2-4 for stability</div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Expected Results</h4>
                    <div className="space-y-1 text-xs">
                      <div>• 1 cluster containing leak patterns</div>
                      <div>• 9 clusters with operational anomalies</div>
                      <div>• 79.6% false positive reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preprocessing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Data Preprocessing Configuration
              </CardTitle>
              <CardDescription>Configure time series data preprocessing parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="windowSize">Sliding Window Size (seconds)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[preprocessingConfig.windowSize]}
                        onValueChange={(value) =>
                          setPreprocessingConfig({ ...preprocessingConfig, windowSize: value[0] })
                        }
                        max={1200}
                        min={80}
                        step={40}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>80s</span>
                        <Badge variant="outline">{preprocessingConfig.windowSize}s</Badge>
                        <span>1200s</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="samplingRate">Sampling Rate (seconds)</Label>
                    <Input
                      id="samplingRate"
                      type="number"
                      value={preprocessingConfig.samplingRate}
                      onChange={(e) =>
                        setPreprocessingConfig({
                          ...preprocessingConfig,
                          samplingRate: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="interpolationMethod">Interpolation Method</Label>
                    <Select
                      value={preprocessingConfig.interpolationMethod}
                      onValueChange={(value) =>
                        setPreprocessingConfig({ ...preprocessingConfig, interpolationMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="cubic">Cubic Spline</SelectItem>
                        <SelectItem value="nearest">Nearest Neighbor</SelectItem>
                        <SelectItem value="polynomial">Polynomial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="normalization">Data Normalization</Label>
                    <Switch
                      id="normalization"
                      checked={preprocessingConfig.normalization}
                      onCheckedChange={(checked) =>
                        setPreprocessingConfig({ ...preprocessingConfig, normalization: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="outlierRemoval">Outlier Removal</Label>
                    <Switch
                      id="outlierRemoval"
                      checked={preprocessingConfig.outlierRemoval}
                      onCheckedChange={(checked) =>
                        setPreprocessingConfig({ ...preprocessingConfig, outlierRemoval: checked })
                      }
                    />
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Preprocessing Impact</h4>
                    <div className="space-y-1 text-xs">
                      <div>• Window size: 80-1200s (stable performance)</div>
                      <div>• Normalization: Improves SVM performance</div>
                      <div>• Outlier removal: Reduces noise in clustering</div>
                      <div>• Linear interpolation: Best for pressure data</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multisource">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Multi-source Analysis Configuration
              </CardTitle>
              <CardDescription>Configure joint analysis of pressure and pump frequency data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableFrequencyAnalysis">Enable Frequency Analysis</Label>
                    <Switch
                      id="enableFrequencyAnalysis"
                      checked={multisourceConfig.enableFrequencyAnalysis}
                      onCheckedChange={(checked) =>
                        setMultisourceConfig({ ...multisourceConfig, enableFrequencyAnalysis: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeAlignment">Time Series Alignment</Label>
                    <Switch
                      id="timeAlignment"
                      checked={multisourceConfig.timeAlignment}
                      onCheckedChange={(checked) =>
                        setMultisourceConfig({ ...multisourceConfig, timeAlignment: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="varianceThreshold">Variance Threshold</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[multisourceConfig.varianceThreshold]}
                        onValueChange={(value) =>
                          setMultisourceConfig({ ...multisourceConfig, varianceThreshold: value[0] })
                        }
                        max={1.0}
                        min={0.01}
                        step={0.01}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0.01</span>
                        <Badge variant="outline">{multisourceConfig.varianceThreshold}</Badge>
                        <span>1.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="correlationThreshold">Correlation Threshold</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[multisourceConfig.correlationThreshold]}
                        onValueChange={(value) =>
                          setMultisourceConfig({ ...multisourceConfig, correlationThreshold: value[0] })
                        }
                        max={1.0}
                        min={0.1}
                        step={0.05}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0.1</span>
                        <Badge variant="outline">{multisourceConfig.correlationThreshold}</Badge>
                        <span>1.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Multi-source Benefits</h4>
                    <div className="space-y-1 text-xs">
                      <div>• Identifies operational vs. leak anomalies</div>
                      <div>• Reduces false positives by 3.95%</div>
                      <div>• Correlates pressure drops with pump changes</div>
                      <div>• Variance = 0: No pump operation detected</div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Configuration Tips</h4>
                    <div className="space-y-1 text-xs">
                      <div>• Variance threshold: 0.1 (optimal for pump detection)</div>
                      <div>• Correlation: 0.7 (strong relationship required)</div>
                      <div>• Always enable time alignment</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
          <CardDescription>Current system configuration overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">One-Class SVM</h4>
              <div className="space-y-1 text-xs">
                <div>Kernel: {ocsvmConfig.kernel.toUpperCase()}</div>
                <div>Nu: {ocsvmConfig.nu}</div>
                <div>Gamma: {ocsvmConfig.gamma}</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Clustering</h4>
              <div className="space-y-1 text-xs">
                <div>Clusters: {clusteringConfig.numClusters}</div>
                <div>Linkage: {clusteringConfig.linkage}</div>
                <div>Distance: {clusteringConfig.distanceMetric}</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Preprocessing</h4>
              <div className="space-y-1 text-xs">
                <div>Window: {preprocessingConfig.windowSize}s</div>
                <div>Sampling: {preprocessingConfig.samplingRate}s</div>
                <div>Normalization: {preprocessingConfig.normalization ? "On" : "Off"}</div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Multi-source</h4>
              <div className="space-y-1 text-xs">
                <div>Frequency: {multisourceConfig.enableFrequencyAnalysis ? "Enabled" : "Disabled"}</div>
                <div>Variance: {multisourceConfig.varianceThreshold}</div>
                <div>Correlation: {multisourceConfig.correlationThreshold}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
