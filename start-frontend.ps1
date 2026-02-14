# MediVault Frontend Startup Script
Write-Host "Starting MediVault Frontend..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "medivault-dapp")) {
    Write-Host "Error: medivault-dapp directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the MediVault root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to frontend directory
Set-Location medivault-dapp

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181
"@ | Out-File -FilePath ".env" -Encoding utf8
}

# Start the development server
Write-Host "Starting React development server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
npm start
