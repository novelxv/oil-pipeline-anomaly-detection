#!/usr/bin/env pwsh

Write-Host "Starting Oil Pipeline Anomaly Detection System" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Use the virtual environment Python if available
$pythonExe = "C:/Users/Lenovo PC/Project/oil-pipeline-anomaly-detection/.venv/Scripts/python.exe"
if (Test-Path $pythonExe) {
    Write-Host "Using virtual environment Python" -ForegroundColor Green
} else {
    $pythonExe = "python"
    Write-Host "Using system Python" -ForegroundColor Yellow
}

# Install Python dependencies (already done, but keeping for completeness)
Write-Host "Python dependencies should already be installed..." -ForegroundColor Green

# Start the Flask API server
Write-Host "Starting API server..." -ForegroundColor Green
Set-Location scripts
$apiProcess = Start-Process -FilePath $pythonExe -ArgumentList "api_server.py" -PassThru -NoNewWindow
$apiPid = $apiProcess.Id

Write-Host "API Server started with PID: $apiPid" -ForegroundColor Green
Write-Host "API available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now start the Next.js frontend with: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop the API server, press Ctrl+C or run: Stop-Process -Id $apiPid" -ForegroundColor Yellow

# Wait for user to stop the process
try {
    Write-Host "Press Ctrl+C to stop the server..." -ForegroundColor Green
    while ($apiProcess -and !$apiProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "Stopping API server..." -ForegroundColor Yellow
    if ($apiProcess -and !$apiProcess.HasExited) {
        Stop-Process -Id $apiPid -Force
    }
}

Write-Host "API server stopped." -ForegroundColor Green
