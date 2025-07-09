const API_BASE_URL = "http://localhost:5000/api"

export interface AnalysisConfig {
  kernel?: string
  nu?: number
  gamma?: string
  window_size?: number
  n_clusters?: number
  linkage?: string
  variance_threshold?: number
  correlation_threshold?: number
}

export interface AnalysisStatus {
  status: "idle" | "running" | "completed" | "error"
  progress: number
  current_step: string
  results?: any
  error?: string
}

export interface DataGenerationConfig {
  duration?: number
  samplingRate?: number
  numPipelines?: number
  leakEvents?: number
  operationalEvents?: number
}

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async healthCheck() {
    return this.request("/health")
  }

  async generateData(config: DataGenerationConfig = {}) {
    return this.request("/generate-data", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async startAnalysis(config: AnalysisConfig = {}) {
    return this.request("/start-analysis", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getAnalysisStatus(): Promise<AnalysisStatus> {
    return this.request("/analysis-status")
  }

  async getAnalysisResults() {
    return this.request("/analysis-results")
  }

  async downloadData() {
    const response = await fetch(`${API_BASE_URL}/download-data`)
    if (!response.ok) {
      throw new Error("Failed to download data")
    }
    return response.blob()
  }

  async getVisualizations() {
    return this.request("/visualizations")
  }

  async saveModelConfig(config: any) {
    return this.request("/model-config", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getModelConfig() {
    return this.request("/model-config")
  }
}

export const apiClient = new ApiClient()
