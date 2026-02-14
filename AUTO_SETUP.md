# MediVault Auto Setup - Complete Guide

## ✅ All Errors Fixed!

I've fixed all the issues in your codebase. Here's what was done:

### Fixed Issues:

1. **Smart Contract Deployment** ✅
   - Fixed Solidity version compatibility (0.8.24 → 0.8.19)
   - Contract deployed at: `0x4b5721DC6388b4143b604C0dd0f19071c3F2C181`
   - Removed problematic Test contract migration

2. **Backend Python Dependencies** ✅
   - Fixed Rust/Cryptography installation issues
   - Updated requirements.txt with proper versions
   - Added error handling for missing dependencies

3. **Blockchain Service** ✅
   - Fixed struct return handling (tuple vs dict formats)
   - Improved error messages
   - Better compatibility with Web3.py

4. **Frontend Blockchain Service** ✅
   - Fixed document struct parsing
   - Handles both tuple and object formats
   - Better error handling

5. **Configuration Files** ✅
   - Created .env files with correct contract address
   - Contract ABI copied to frontend
   - All paths configured correctly

## Quick Start (3 Steps)

### Step 1: Run Setup Script

```powershell
.\setup.ps1
```

This will:
- Check prerequisites (Python, Node.js)
- Create virtual environment
- Install all Python dependencies (including cryptography)
- Install all npm dependencies
- Copy contract ABI
- Create .env files

### Step 2: Start Services

**Option A: Start Everything at Once**
```powershell
.\start-all.ps1
```

**Option B: Start Individually**
```powershell
# Terminal 1 - Backend
.\start-backend.ps1

# Terminal 2 - Frontend  
.\start-frontend.ps1
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Manual Setup (If Scripts Don't Work)

### Backend Setup

```powershell
cd medivault-backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies (cryptography first to avoid Rust issues)
pip install --upgrade pip
pip install cryptography
pip install -r requirements.txt

# Create .env file (if not exists)
# Copy from medivault-backend/.env.example or use the one already created

# Start server
uvicorn main:app --reload
```

### Frontend Setup

```powershell
cd medivault-dapp

# Install dependencies
npm install

# Create .env file (if not exists)
# Should contain:
# REACT_APP_API_URL=http://localhost:8000
# REACT_APP_CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181

# Start development server
npm start
```

## Prerequisites

Make sure these are running:

1. **MongoDB**
   ```powershell
   mongod
   ```

2. **Ganache**
   - Open Ganache
   - Use Quickstart or create workspace
   - Should be on port 7545
   - Contract is already deployed

3. **MetaMask** (Browser Extension)
   - Install MetaMask
   - Add Ganache network:
     - Network Name: Ganache
     - RPC URL: http://127.0.0.1:7545
     - Chain ID: 1337
     - Currency: ETH
   - Import account from Ganache

## Configuration

### Backend (.env)
Located at: `medivault-backend/.env`

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=medivault
SECRET_KEY=medivault-secret-key-change-in-production-2024
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181
CONTRACT_ABI_PATH=../medivault-chain/build/contracts/MediVaultAccess.json
IPFS_HOST=127.0.0.1
IPFS_PORT=5001
```

### Frontend (.env)
Located at: `medivault-dapp/.env`

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CONTRACT_ADDRESS=0x4b5721DC6388b4143b604C0dd0f19071c3F2C181
```

## First Use

1. **Open**: http://localhost:3000
2. **Connect MetaMask** with a Ganache account
3. **Register Admin User**:
   - Email: admin@medivault.com
   - Password: (your choice)
   - Role: Admin
   - Wallet Address: (your MetaMask address)
4. **Login** and start using the system!

## Troubleshooting

### Backend won't start
- Check MongoDB: `mongod`
- Check Ganache: Running on port 7545
- Check Python: `python --version` (should be 3.8+)
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Check Node.js: `node --version` (should be 14+)
- Reinstall: `npm install`
- Check .env file exists

### Contract errors
- Verify contract address in .env files
- Check contract ABI exists: `medivault-dapp/src/contracts/MediVaultAccess.json`
- Ensure Ganache is running

### IPFS errors
- For development, files will use public IPFS gateway
- For production, set up Pinata (add API keys to .env)

## All Files Created/Fixed

✅ `medivault-backend/.env` - Backend configuration
✅ `medivault-dapp/.env` - Frontend configuration  
✅ `medivault-dapp/src/contracts/MediVaultAccess.json` - Contract ABI
✅ `setup.ps1` - Complete setup script
✅ `start-backend.ps1` - Backend startup script
✅ `start-frontend.ps1` - Frontend startup script
✅ `start-all.ps1` - Start everything script
✅ Fixed blockchain_service.py - Better struct handling
✅ Fixed blockchainService.js - Better struct parsing
✅ Updated requirements.txt - Added cryptography

## Next Steps

1. Run `.\setup.ps1` to install everything
2. Start MongoDB and Ganache
3. Run `.\start-all.ps1` to start services
4. Open http://localhost:3000 and start using MediVault!

Everything is ready to go! 🚀
