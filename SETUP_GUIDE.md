# MediVault Setup Guide

Complete setup guide for the blockchain medical document management system.

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB
- Ganache (for local blockchain)
- MetaMask browser extension
- IPFS node (optional, can use Pinata instead)

## Step 1: Blockchain Setup

### 1.1 Install Ganache
Download and install Ganache from https://trufflesuite.com/ganache/

### 1.2 Start Ganache
- Open Ganache
- Create a new workspace or use Quickstart
- Note the RPC Server URL (default: http://127.0.0.1:7545)
- Note the Network ID (default: 5777)

### 1.3 Deploy Smart Contract

```bash
cd medivault-chain
npm install
truffle migrate --network development
```

After deployment, note the contract address from the migration output.

### 1.4 Update Contract Address
- Copy the contract ABI from `build/contracts/MediVaultAccess.json` to `medivault-dapp/src/contracts/MediVaultAccess.json`
- Update `REACT_APP_CONTRACT_ADDRESS` in `medivault-dapp/.env`
- Update `CONTRACT_ADDRESS` in `medivault-backend/.env`

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd medivault-backend
pip install -r requirements.txt
```

### 2.2 Configure Environment

Create `medivault-backend/.env`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=medivault
SECRET_KEY=your-secret-key-change-in-production
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<your-contract-address>
CONTRACT_ABI_PATH=../medivault-chain/build/contracts/MediVaultAccess.json

# IPFS Configuration (choose one)
# Option 1: Local IPFS
IPFS_HOST=127.0.0.1
IPFS_PORT=5001

# Option 2: Pinata (recommended)
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret-key
```

### 2.3 Start MongoDB

```bash
mongod
```

### 2.4 Run Backend

```bash
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd medivault-dapp
npm install
```

### 3.2 Configure Environment

Create `medivault-dapp/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CONTRACT_ADDRESS=<your-contract-address>
REACT_APP_PINATA_JWT=<your-pinata-jwt>
```

### 3.3 Run Frontend

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Step 4: MetaMask Configuration

### 4.1 Install MetaMask
Install MetaMask browser extension

### 4.2 Add Ganache Network
1. Open MetaMask
2. Click network dropdown → Add Network
3. Enter:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

### 4.3 Import Account
1. In Ganache, click the key icon next to an account
2. Copy the private key
3. In MetaMask, click account icon → Import Account
4. Paste the private key

## Step 5: IPFS Setup (Choose One)

### Option A: Pinata (Recommended for Development)

1. Sign up at https://pinata.cloud
2. Get your API Key and Secret Key
3. Add to backend `.env`:
   ```
   PINATA_API_KEY=your-key
   PINATA_SECRET_KEY=your-secret
   ```
4. For frontend, create a JWT token with pinning permissions
5. Add to frontend `.env`:
   ```
   REACT_APP_PINATA_JWT=your-jwt
   ```

### Option B: Local IPFS Node

1. Install IPFS: https://docs.ipfs.io/install/
2. Initialize: `ipfs init`
3. Start daemon: `ipfs daemon`
4. Update backend `.env`:
   ```
   IPFS_HOST=127.0.0.1
   IPFS_PORT=5001
   ```

## Step 6: Initial Setup

### 6.1 Create Admin User

1. Start the backend
2. Register an admin user via API:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medivault.com",
    "password": "admin123",
    "role": "Admin",
    "wallet_address": "<ganache-account-address>",
    "full_name": "Admin User"
  }'
```

### 6.2 Register User on Blockchain

The backend will automatically register users on the blockchain when they sign up with a wallet address. For the admin account, you may need to manually register:

1. Use Truffle console:
```bash
cd medivault-chain
truffle console --network development
```

2. In console:
```javascript
const contract = await MediVaultAccess.deployed()
await contract.registerUser("<admin-wallet-address>", 1) // 1 = Admin role
```

## Step 7: Testing

1. Open `http://localhost:3000`
2. Login with admin credentials
3. Connect MetaMask
4. Test document upload
5. Verify document appears on blockchain

## Troubleshooting

### Contract Not Found
- Ensure contract is deployed and address is correct
- Check that ABI file exists in frontend

### MetaMask Connection Issues
- Ensure Ganache is running
- Check network configuration in MetaMask
- Verify account has ETH (Ganache provides test ETH)

### IPFS Upload Fails
- Check Pinata credentials or local IPFS node
- Verify network connectivity

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`

## Architecture Overview

```
┌─────────────┐
│   React     │  Frontend (Port 3000)
│   Frontend  │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────┐
│   FastAPI   │  Backend (Port 8000)
│   Backend   │
└──────┬──────┘
       │
       ├──────────┐
       │          │
┌──────▼──────┐  │
│  MongoDB    │  │
│  (Metadata) │  │
└─────────────┘  │
                 │
       ┌─────────┴─────────┐
       │                   │
┌──────▼──────┐   ┌────────▼──────┐
│   IPFS      │   │   Ganache     │
│  (Storage)  │   │  (Blockchain) │
└─────────────┘   └───────────────┘
```

## Role Permissions

| Role      | Upload | View | Download | Delete | User Mgmt |
|-----------|--------|------|----------|--------|-----------|
| Admin     | ✅     | ✅   | ✅       | ✅     | ✅        |
| Doctor    | ✅     | ✅   | ✅       | ❌     | ❌        |
| Nurse     | ✅     | ✅   | ✅       | ❌     | ❌        |
| Student   | ❌     | ✅   | ✅       | ❌     | ❌        |
| Patient   | ❌     | ✅*  | ✅*      | ❌     | ❌        |

*Patients can only view/download their own documents

## Next Steps

- Set up production environment
- Configure SSL/TLS
- Implement additional security measures
- Set up monitoring and logging
- Configure backup strategies
