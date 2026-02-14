# MediVault Quick Start Guide

## Prerequisites

1. **Python 3.8+** - [Download](https://www.python.org/downloads/)
2. **Node.js 14+** - [Download](https://nodejs.org/)
3. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
4. **Ganache** - [Download](https://trufflesuite.com/ganache/)
5. **MetaMask** - Browser extension

## Quick Setup (Automated)

### Option 1: Use Startup Scripts (Easiest)

1. **Start MongoDB:**
   ```powershell
   mongod
   ```

2. **Start Ganache:**
   - Open Ganache
   - Create new workspace or use Quickstart
   - Note: Contract is already deployed at `0x4b5721DC6388b4143b604C0dd0f19071c3F2C181`

3. **Run the startup script:**
   ```powershell
   .\start-all.ps1
   ```

This will automatically:
- Check prerequisites
- Install dependencies
- Start backend (http://localhost:8000)
- Start frontend (http://localhost:3000)

### Option 2: Manual Setup

#### Backend Setup

```powershell
cd medivault-backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install cryptography
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

#### Frontend Setup

```powershell
cd medivault-dapp

# Install dependencies
npm install

# Start development server
npm start
```

## Configuration

### Backend (.env)
Already configured with:
- Contract address: `0x4b5721DC6388b4143b604C0dd0f19071c3F2C181`
- MongoDB: `mongodb://localhost:27017`
- Ganache: `http://127.0.0.1:7545`

### Frontend (.env)
Already configured with:
- API URL: `http://localhost:8000`
- Contract address: `0x4b5721DC6388b4143b604C0dd0f19071c3F2C181`

## First Steps

1. **Open the app:** http://localhost:3000

2. **Connect MetaMask:**
   - Install MetaMask extension
   - Add Ganache network:
     - Network Name: Ganache
     - RPC URL: http://127.0.0.1:7545
     - Chain ID: 1337
     - Currency: ETH
   - Import an account from Ganache (use private key)

3. **Register Admin User:**
   - Use the API or create via frontend
   - The deployer account (first Ganache account) is already Admin on blockchain

4. **Start using the system!**

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongod`
- Check Ganache is running on port 7545
- Verify Python dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check .env file exists

### Contract errors
- Verify Ganache is running
- Check contract address in .env files
- Ensure contract ABI is in `medivault-dapp/src/contracts/MediVaultAccess.json`

### IPFS errors
- For development, you can use Pinata (set API keys in .env)
- Or set up local IPFS node

## Default Accounts

The first Ganache account is automatically set as Admin in the contract.

## API Endpoints

- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Need Help?

See `SETUP_GUIDE.md` for detailed instructions.
