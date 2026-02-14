# MediVault Backend Startup Script
Write-Host "Starting MediVault Backend..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "medivault-backend")) {
    Write-Host "Error: medivault-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the MediVault root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location medivault-backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install/upgrade dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install cryptography
pip install -r requirements.txt

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
}

# Start the server
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
uvicorn main:app --reload --host 0.0.0.0 --port 8000
