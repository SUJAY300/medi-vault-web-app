# MediVault Complete Setup Script
# This script will set up everything automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MediVault Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Function to check if command exists
function Test-Command {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) {
            return $true
        }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$prereqsOk = $true

if (-not (Test-Command "python")) {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    $prereqsOk = $false
} else {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
}

if (-not (Test-Command "node")) {
    Write-Host "✗ Node.js not found! Please install Node.js 14+" -ForegroundColor Red
    $prereqsOk = $false
} else {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
}

if (-not (Test-Command "npm")) {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    $prereqsOk = $false
} else {
    Write-Host "✓ npm found" -ForegroundColor Green
}

if (-not $prereqsOk) {
    Write-Host ""
    Write-Host "Please install missing prerequisites and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Backend setup
Set-Location medivault-backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install cryptography first (to avoid Rust issues)
Write-Host "Installing cryptography..." -ForegroundColor Yellow
pip install cryptography --quiet

# Install all dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Some dependencies may have failed. Continuing..." -ForegroundColor Yellow
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envLines = @(
        "# MongoDB Configuration",
        "MONGODB_URL=mongodb://localhost:27017",
        "DATABASE_NAME=medivault",
        "",
        "# JWT Secret Key",
        "SECRET_KEY=medivault-secret-key-change-in-production-2024",
        "",
        "# Ganache Configuration",
        "GANACHE_URL=http://127.0.0.1:7545",
        "",
        "# Contract Configuration",
        "CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181",
        "CONTRACT_ABI_PATH=../medivault-chain/build/contracts/MediVaultAccess.json",
        "",
        "# IPFS Configuration",
        "IPFS_HOST=127.0.0.1",
        "IPFS_PORT=5001"
    )
    $envLines | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✓ .env file created" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Frontend setup
Set-Location medivault-dapp

# Copy contract ABI if needed
if (-not (Test-Path "src\contracts\MediVaultAccess.json")) {
    Write-Host "Copying contract ABI..." -ForegroundColor Yellow
    if (Test-Path "..\medivault-chain\build\contracts\MediVaultAccess.json") {
        Copy-Item "..\medivault-chain\build\contracts\MediVaultAccess.json" "src\contracts\MediVaultAccess.json" -Force
        Write-Host "✓ Contract ABI copied" -ForegroundColor Green
    } else {
        Write-Host "⚠ Contract ABI not found. Make sure to deploy the contract first." -ForegroundColor Yellow
    }
}

# Install npm dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies (this may take a while)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ npm install had some issues. Continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envLines = @(
        "REACT_APP_API_URL=http://localhost:8000",
        "REACT_APP_CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181"
    )
    $envLines | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✓ .env file created" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running: mongod" -ForegroundColor White
Write-Host "2. Make sure Ganache is running on port 7545" -ForegroundColor White
Write-Host "3. Run: .\start-all.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or start services individually:" -ForegroundColor Yellow
Write-Host "  Backend:  .\start-backend.ps1" -ForegroundColor White
Write-Host "  Frontend: .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
