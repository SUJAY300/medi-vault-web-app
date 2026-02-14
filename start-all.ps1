# MediVault Complete Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MediVault Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check MongoDB (optional check)
try {
    $mongoCheck = Get-Process -Name mongod -ErrorAction SilentlyContinue
    if ($mongoCheck) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB not detected. Make sure MongoDB is running!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status" -ForegroundColor Yellow
}

# Check Ganache (optional check)
try {
    $ganacheCheck = Get-Process -Name ganache -ErrorAction SilentlyContinue
    if ($ganacheCheck) {
        Write-Host "✓ Ganache is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ Ganache not detected. Make sure Ganache is running on port 7545!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check Ganache status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start backend in a new window
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-backend.ps1"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the PowerShell windows to stop the services." -ForegroundColor Gray
