# MediVault - Blockchain Medical Document Management System

## Overview

MediVault is a comprehensive blockchain-based medical document management system that provides secure, decentralized storage and role-based access control for medical records.

## Architecture

### Components

1. **Smart Contract** (`medivault-chain/`)
   - Solidity contract for access control and document tracking
   - Deployed on Ganache (local blockchain)
   - Roles: Admin, Doctor, Nurse, Student, Patient

2. **Backend API** (`medivault-backend/`)
   - FastAPI REST API
   - MongoDB for user data and metadata
   - IPFS integration for file storage
   - Web3.py for blockchain interaction

3. **Frontend DApp** (`medivault-dapp/`)
   - React application
   - MetaMask integration
   - Role-based dashboards
   - Document management UI

## Features Implemented

### ✅ Smart Contract Features
- Role-based access control (Admin, Doctor, Nurse, Student, Patient)
- Document upload tracking with IPFS hash
- Document deletion (Admin only)
- Patient document retrieval
- User registration on blockchain

### ✅ Backend Features
- JWT-based authentication
- User registration and login
- Role-based API endpoints
- IPFS file upload/download
- Blockchain transaction management
- MongoDB metadata storage

### ✅ Frontend Features
- MetaMask wallet integration
- Role-based dashboards:
  - **Admin**: Full access, user management, document deletion
  - **Doctor/Nurse**: Upload, view, download documents
  - **Student**: View and download for case studies
  - **Patient**: View only own documents
- Document upload with IPFS
- Document viewing and downloading
- Blockchain transaction visibility

## File Structure

```
MediVault/
├── medivault-chain/          # Blockchain project
│   ├── contracts/
│   │   └── MediVaultAccess.sol
│   ├── migrations/
│   └── truffle-config.js
│
├── medivault-backend/        # FastAPI backend
│   ├── main.py              # Main API application
│   ├── models.py            # Pydantic models
│   ├── auth.py              # Authentication
│   ├── ipfs_service.py      # IPFS integration
│   ├── blockchain_service.py # Web3 integration
│   └── requirements.txt
│
├── medivault-dapp/          # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── PatientDashboard.js
│   │   │   ├── DocumentUpload.js
│   │   │   ├── DocumentList.js
│   │   │   └── UserManagement.js
│   │   └── services/
│   │       ├── apiService.js
│   │       ├── blockchainService.js
│   │       └── ipfsService.js
│   └── package.json
│
├── SETUP_GUIDE.md           # Detailed setup instructions
└── PROJECT_SUMMARY.md       # This file
```

## Role Permissions Matrix

| Action          | Admin | Doctor | Nurse | Student | Patient |
|----------------|-------|--------|-------|---------|---------|
| Upload Docs     | ✅     | ✅     | ✅     | ❌      | ❌      |
| View Docs       | ✅     | ✅     | ✅     | ✅      | ✅*     |
| Download Docs   | ✅     | ✅     | ✅     | ✅      | ✅*     |
| Delete Docs     | ✅     | ❌     | ❌     | ❌      | ❌      |
| User Management | ✅     | ❌     | ❌     | ❌      | ❌      |

*Patients can only access their own documents

## Technology Stack

- **Blockchain**: Solidity, Truffle, Ganache, Web3.js, Web3.py
- **Backend**: FastAPI, MongoDB, Motor (async MongoDB driver)
- **Frontend**: React, Web3.js, Axios
- **Storage**: IPFS (via Pinata or local node)
- **Authentication**: JWT, bcrypt
- **Wallet**: MetaMask

## Setup Quick Start

1. **Start Ganache** (port 7545)
2. **Deploy Contract**: `cd medivault-chain && truffle migrate`
3. **Start MongoDB**
4. **Start Backend**: `cd medivault-backend && uvicorn main:app --reload`
5. **Start Frontend**: `cd medivault-dapp && npm start`
6. **Configure MetaMask** with Ganache network
7. **Register Admin** via API or frontend

See `SETUP_GUIDE.md` for detailed instructions.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Current user
- `GET /api/users` - All users (Admin)

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get documents
- `GET /api/documents/{hash}/download` - Download document
- `DELETE /api/documents/{hash}` - Delete document (Admin)

## Smart Contract Functions

- `registerUser(address, role)` - Register user (Admin)
- `uploadDocument(ipfsHash, fileName, patientAddress)` - Upload document
- `getPatientDocuments(patientAddress)` - Get patient documents
- `deleteDocument(patientAddress, index)` - Delete document (Admin)
- `getUserRole(address)` - Get user role

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control on both backend and blockchain
3. **File Storage**: IPFS for decentralized storage
4. **Blockchain**: Immutable record of all document operations
5. **Password Hashing**: bcrypt for secure password storage

## Next Steps / Future Enhancements

- [ ] Add document encryption before IPFS upload
- [ ] Implement document sharing between healthcare providers
- [ ] Add audit logging
- [ ] Implement document versioning
- [ ] Add search functionality
- [ ] Implement notifications
- [ ] Add document categories/tags
- [ ] Implement consent management
- [ ] Add analytics dashboard
- [ ] Deploy to testnet/mainnet
- [ ] Add comprehensive testing

## Notes

- The system uses Ganache for local development
- For production, deploy to a testnet (Ropsten, Rinkeby) or mainnet
- IPFS files can be pinned via Pinata for persistence
- MongoDB stores metadata; actual files are on IPFS
- Blockchain stores document hashes and access records

## Support

For issues or questions, refer to:
- `SETUP_GUIDE.md` for setup instructions
- Backend README for API documentation
- Frontend README for DApp usage
