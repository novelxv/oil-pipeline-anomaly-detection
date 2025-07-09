# Oil Pipeline Anomaly Detection System

This project is an end-to-end system for detecting anomalies in oil pipeline data. It consists of a Python-based backend API for anomaly detection and a Next.js frontend for visualization and interaction.

**Based on the research paper**: [Research on an Oil Pipeline Anomaly Identification Method for Distinguishing True and False Anomalies](https://onlinelibrary.wiley.com/doi/10.1155/2022/9366897)

## Features
- **Synthetic Data Generation**: Generate pipeline data for testing and development.
- **Anomaly Detection**: Detect anomalies using machine learning models (e.g., One-Class SVM, Hierarchical Clustering).
- **API Server**: Flask-based Python API to serve detection results and data.
- **Modern Frontend**: Next.js + Tailwind CSS UI for configuration, visualization, and results.

## Project Structure
```
├── app/                  # Next.js app directory (frontend)
├── components/           # React components (UI, features)
├── hooks/                # Custom React hooks
├── lib/                  # Frontend utilities and API helpers
├── public/               # Static assets
├── scripts/              # Python backend scripts (API, models, data gen)
├── styles/               # Global styles
├── start_server.ps1      # PowerShell script to start backend
├── start_server.sh       # Bash script to start backend (Linux/Mac)
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- (Recommended) Create a Python virtual environment

### 1. Install Python Dependencies
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```powershell
npm install
```

### 3. Start the Backend API Server
On Windows:
```powershell
./start_server.ps1
```
On Linux/Mac:
```bash
./start_server.sh
```

### 4. Start the Frontend
```powershell
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

## Usage
- Configure and run anomaly detection from the web UI.
- Visualize results and statistics interactively.
- Use the API endpoints for programmatic access (see `scripts/api_server.py`).

## Main Scripts
- `scripts/api_server.py`: Flask API server
- `scripts/generate_pipeline_data.py`: Synthetic data generator
- `scripts/one_class_svm_detector.py`: One-Class SVM anomaly detector
- `scripts/hierarchical_clustering.py`: Hierarchical clustering detector

## Development
- UI components are in `components/` and `components/ui/`.
- Custom hooks in `hooks/`.
- API and utility functions in `lib/`.

## References
This project is based on the research paper:
- **Research on an Oil Pipeline Anomaly Identification Method for Distinguishing True and False Anomalies** (2022)
- DOI: [10.1155/2022/9366897](https://onlinelibrary.wiley.com/doi/10.1155/2022/9366897)

---

Feel free to contribute or open issues for improvements!