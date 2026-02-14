# MediVault Backend API

FastAPI backend for the MediVault blockchain medical document management system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `MONGODB_URL`: MongoDB connection string
- `SECRET_KEY`: JWT secret key (change in production)
- `GANACHE_URL`: Ganache RPC URL
- `CONTRACT_ADDRESS`: Deployed MediVaultAccess contract address
- `PINATA_API_KEY` and `PINATA_SECRET_KEY`: For IPFS pinning (optional)

4. Make sure MongoDB is running:
```bash
mongod
```

5. Make sure Ganache is running on port 7545

6. Deploy the smart contract and update `CONTRACT_ADDRESS` in `.env`

7. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token

### Users
- `GET /api/users/me` - Get current user info
- `GET /api/users` - Get all users (Admin only)

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - Get documents (role-based access)
- `GET /api/documents/{ipfs_hash}/download` - Download a document
- `DELETE /api/documents/{ipfs_hash}` - Delete a document (Admin only)

## Role-Based Access

- **Admin**: Full access (upload, view, download, delete)
- **Doctor/Nurse**: Upload, view, download (no delete)
- **Student**: View, download (for case studies)
- **Patient**: View only their own documents
