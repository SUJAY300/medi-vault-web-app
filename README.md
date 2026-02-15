# MediVault - Medical Document Management System

<div align="center">

**A comprehensive, secure, and scalable medical document management platform with AI-powered assistance and blockchain-based document storage.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)
- [Team Collaboration](#team-collaboration)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)

---

## 🎯 Overview

MediVault is a role-based medical document management system designed for healthcare professionals, patients, and medical students. The platform provides secure document storage, AI-powered chatbot assistance, and blockchain-based document verification.

### Key Capabilities

- **Multi-role Authentication**: Email/password for professionals, OTP-based for patients
- **Role-Based Access Control**: Five distinct user roles with tailored permissions
- **Document Management**: Upload, organize, and manage medical documents with metadata
- **AI Chatbot**: Intelligent assistant for medical queries (in development)
- **Blockchain Integration**: Immutable document storage and verification (in development)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Professional Login**: Email and password authentication for Admin, Doctor, Nurse, and Student roles
- **Patient Login**: Phone number with OTP (One-Time Password) verification via SMS
- **Role-Based Dashboards**: Customized interfaces for each user role
- **Secure Password Hashing**: bcryptjs for password encryption

### 📄 Document Management
- **Document Upload**: Support for various medical document types
- **Metadata Management**: Flexible document metadata storage in MongoDB
- **Document Organization**: Tag-based categorization and search
- **Access Control**: Role-based document visibility and permissions

### 🤖 AI Chatbot (In Development)
- Medical query assistance
- Document summarization
- Context-aware responses

### ⛓️ Blockchain Storage (In Development)
- Immutable document hash storage
- IPFS integration for decentralized storage
- Document verification and integrity checks

---

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** architectural pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  (API Routes - Thin Layer, Delegates to Controllers)    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Controllers Layer                     │
│         (Request Handlers, Input Validation)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                        │
│         (Business Logic, External Integrations)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Models Layer                          │
│         (Data Models, Database Schemas)                 │
└─────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Injection**: Services are injected into controllers
3. **Error Handling**: Centralized error handling in controllers
4. **Type Safety**: TypeScript and Zod schemas for validation
5. **Scalability**: Modular structure allows easy feature addition

---

## 📁 Project Structure

### Complete Directory Tree

```
medi-vault-web-app/
│
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes (Next.js Route Handlers)
│   │   ├── 📂 auth/                 # Authentication endpoints
│   │   │   ├── login/route.js       # POST /api/auth/login
│   │   │   ├── signup/route.js      # POST /api/auth/signup
│   │   │   └── otp/                 # OTP endpoints
│   │   │       ├── send/route.js    # POST /api/auth/otp/send
│   │   │       └── verify/route.js # POST /api/auth/otp/verify
│   │   └── 📂 documents/            # Document management endpoints
│   │       ├── route.js             # GET, POST /api/documents
│   │       └── [id]/route.js        # GET, PATCH, DELETE /api/documents/:id
│   │
│   ├── 📂 auth/                     # Authentication pages
│   │   ├── login/page.jsx          # Login page component
│   │   └── signup/page.jsx          # Signup page component
│   │
│   ├── 📂 dashboard/                 # Dashboard pages (role-based)
│   │   ├── layout.jsx               # Dashboard layout with sidebar
│   │   ├── 📂 admin/                 # Admin dashboard pages
│   │   ├── 📂 doctor/                # Doctor dashboard pages
│   │   ├── 📂 nurse/                 # Nurse dashboard pages
│   │   ├── 📂 student/               # Student dashboard pages
│   │   └── 📂 patient/               # Patient dashboard pages
│   │
│   ├── globals.css                   # Global styles
│   ├── layout.jsx                    # Root layout
│   └── page.jsx                      # Landing page
│
├── 📂 backend/                       # Backend Logic (MVC Structure)
│   │
│   ├── 📂 config/                    # Configuration Files
│   │   ├── db.js                     # Prisma/MySQL connection configuration
│   │   ├── mongodb.js                # MongoDB connection and setup
│   │   └── twilio.js                 # Twilio SMS service configuration
│   │
│   ├── 📂 controllers/              # Request Handlers (MVC Controllers)
│   │   ├── authController.js         # Authentication logic (login, signup)
│   │   ├── otpController.js          # OTP generation and verification
│   │   ├── documentController.js    # Document CRUD operations
│   │   ├── 📂 chatbot/               # Chatbot-specific controllers
│   │   │   └── chatbotController.js # Chatbot message handling
│   │   └── 📂 blockchain/            # Blockchain-specific controllers
│   │       └── blockchainController.js # Blockchain operations
│   │
│   ├── 📂 services/                  # Business Logic Layer
│   │   ├── authService.js            # Main auth service (with fallback)
│   │   ├── authDbService.js          # Database-backed auth service
│   │   ├── authStoreService.js        # In-memory auth service (dev/demo)
│   │   ├── 📂 chatbot/               # Chatbot services
│   │   │   └── llmService.js         # LLM integration service
│   │   └── 📂 blockchain/            # Blockchain services
│   │       └── blockchainService.js  # Blockchain operations service
│   │
│   ├── 📂 models/                    # Data Models
│   │   ├── document.js               # MongoDB Document model
│   │   ├── 📂 chatbot/               # Chatbot data models
│   │   └── 📂 blockchain/            # Blockchain data models
│   │
│   ├── 📂 middlewares/               # Middleware Functions
│   │   └── (Future: auth, validation, error handling)
│   │
│   ├── 📂 routes/                    # Route Definitions
│   │   └── (Future: Express routes if needed)
│   │
│   └── 📂 utils/                     # Utility Functions
│       ├── 📂 chatbot/               # Chatbot utilities
│       └── 📂 blockchain/            # Blockchain utilities
│
├── 📂 components/                    # Next.js Accessible Components
│   ├── sidebar.jsx                   # Dashboard sidebar navigation
│   └── 📂 ui/                        # Reusable UI components (Radix UI)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (57+ components)
│
├── 📂 frontend/                      # Frontend Source Code
│   ├── 📂 src/
│   │   ├── 📂 components/            # React components (organized by feature)
│   │   │   ├── 📂 auth/              # Authentication components
│   │   │   ├── 📂 dashboard/         # Dashboard-specific components
│   │   │   ├── 📂 documents/         # Document-related components
│   │   │   ├── 📂 chatbot/           # Chatbot UI components
│   │   │   ├── 📂 blockchain/       # Blockchain UI components
│   │   │   ├── 📂 common/            # Shared/common components
│   │   │   └── 📂 layout/            # Layout components
│   │   │
│   │   ├── 📂 pages/                 # Page components
│   │   ├── 📂 api/                   # API client functions
│   │   ├── 📂 hooks/                 # Custom React hooks
│   │   ├── 📂 context/               # React Context providers
│   │   ├── 📂 utils/                 # Frontend utilities
│   │   └── globals.css               # Global styles (copy)
│   │
│   └── 📂 public/                    # Static Assets
│       ├── images/                  # Image assets
│       └── ... (icons, logos, etc.)
│
├── 📂 shared/                        # Shared Code (Backend & Frontend)
│   ├── 📂 schemas/                   # Zod Validation Schemas
│   │   └── authSchemas.js            # Authentication validation schemas
│   ├── 📂 types/                     # TypeScript Type Definitions
│   └── 📂 utils/                     # Shared Utility Functions
│       └── utils.ts                  # Common utilities (cn, etc.)
│
├── 📂 prisma/                        # Prisma ORM Configuration
│   ├── schema.prisma                 # Database schema definition
│   └── seed.js                       # Database seeding script
│
├── 📂 hooks/                         # Next.js Accessible Hooks
│   └── hooks/                        # Custom hooks (use-toast, use-mobile)
│
├── 📂 public/                        # Public Static Assets (Next.js)
│   └── ... (favicons, images, etc.)
│
├── docker-compose.yml                # Docker services (MySQL, MongoDB)
├── next.config.mjs                   # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
├── components.json                   # shadcn/ui configuration
└── README.md                         # This file
```

---

## 📖 Directory Explanations

### `/app` - Next.js App Router
**Purpose**: Next.js 13+ App Router directory containing pages and API routes.

- **`app/api/`**: API route handlers (thin layer that delegates to controllers)
  - These files handle HTTP requests and call backend controllers
  - Keep this layer thin - business logic should be in controllers/services
  
- **`app/auth/`**: Authentication pages (login, signup)
  - Client-side React components for user authentication
  
- **`app/dashboard/`**: Role-based dashboard pages
  - Each role has its own subdirectory with specific pages
  - `layout.jsx` provides the dashboard layout with sidebar

### `/backend` - Backend Logic (MVC)

#### `/backend/config`
**Purpose**: Configuration files for external services and databases.

- **`db.js`**: Prisma client initialization for MySQL
- **`mongodb.js`**: MongoDB connection setup using Mongoose
- **`twilio.js`**: Twilio SMS service configuration for OTP delivery

#### `/backend/controllers`
**Purpose**: Request handlers that process HTTP requests and return responses.

- **`authController.js`**: Handles login and signup logic
- **`otpController.js`**: Manages OTP generation, sending, and verification
- **`documentController.js`**: CRUD operations for medical documents
- **`chatbot/`**: Chatbot-specific request handlers (in development)
- **`blockchain/`**: Blockchain operation handlers (in development)

**Note**: Controllers should be thin - they validate input, call services, and return responses.

#### `/backend/services`
**Purpose**: Business logic layer - contains core application logic.

- **`authService.js`**: Main authentication service with database/in-memory fallback
- **`authDbService.js`**: Database-backed authentication (Prisma/MySQL)
- **`authStoreService.js`**: In-memory authentication for development/demo
- **`chatbot/llmService.js`**: LLM integration service (OpenAI, Anthropic, etc.)
- **`blockchain/blockchainService.js`**: Blockchain operations (Ethereum, IPFS, etc.)

**Note**: Services contain business logic and should be independent of HTTP concerns.

#### `/backend/models`
**Purpose**: Data models and database schemas.

- **`document.js`**: Mongoose schema for medical documents
- **`chatbot/`**: Chatbot conversation and message models
- **`blockchain/`**: Blockchain transaction and hash models

#### `/backend/middlewares`
**Purpose**: Middleware functions for request processing.

- Currently empty, but can include:
  - Authentication middleware
  - Request validation middleware
  - Error handling middleware
  - Logging middleware

#### `/backend/utils`
**Purpose**: Utility functions and helpers.

- **`chatbot/`**: Chatbot-specific utilities (prompt templates, formatters)
- **`blockchain/`**: Blockchain utilities (hash functions, signature verification)

### `/components` - Next.js Components
**Purpose**: Components accessible via `@/components` alias in Next.js.

- **`sidebar.jsx`**: Dashboard sidebar navigation component
- **`ui/`**: Reusable UI component library (57+ components from Radix UI)
  - These are shadcn/ui components for consistent UI

### `/frontend` - Frontend Source Code
**Purpose**: Organized frontend code structure (for reference and future expansion).

- **`src/components/`**: React components organized by feature
  - Each feature has its own subdirectory
  - Can be moved to `/components` when needed for Next.js
  
- **`src/api/`**: API client functions for making HTTP requests
- **`src/hooks/`**: Custom React hooks
- **`src/context/`**: React Context providers
- **`src/utils/`**: Frontend-specific utilities

### `/shared` - Shared Code
**Purpose**: Code shared between backend and frontend.

- **`schemas/`**: Zod validation schemas
  - Used for both frontend form validation and backend API validation
  - **`authSchemas.js`**: All authentication-related schemas
  
- **`types/`**: TypeScript type definitions
  - Shared interfaces and types
  
- **`utils/`**: Shared utility functions
  - **`utils.ts`**: Common utilities like `cn()` for className merging

### `/prisma` - Database Schema
**Purpose**: Prisma ORM configuration and database schema.

- **`schema.prisma`**: Database schema definition
  - Defines User and OtpSession models
  - MySQL database configuration
  
- **`seed.js`**: Database seeding script
  - Creates initial admin user for development

### `/hooks` - Custom Hooks
**Purpose**: Custom React hooks accessible in Next.js.

- **`hooks/use-toast.ts`**: Toast notification hook
- **`hooks/use-mobile.ts`**: Mobile device detection hook

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **MongoDB**: Version 7.0 or higher (install locally or use MongoDB Atlas)
- **Git**: For version control

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd medi-vault-web-app
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI="mongodb://localhost:27017/medivault"

# Twilio Configuration (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Node Environment
NODE_ENV=development
```

**Note**: 
- If `MONGODB_URI` is not set, the app uses in-memory authentication (demo mode)
- If Twilio credentials are not set, OTP is logged to console in development mode

#### 4. Start MongoDB

Make sure MongoDB is running locally on port `27017`, or use MongoDB Atlas and update `MONGODB_URI` accordingly.

**Local MongoDB:**
- Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service: `mongod` (or use your system's service manager)

**MongoDB Atlas (Cloud):**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Update `MONGODB_URI` with your connection string

#### 5. Initialize Database

```bash
# Seed database with demo admin
npm run db:seed
```

#### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Demo Credentials

**Admin Account**:
- Email: `admin@medivault.com`
- Password: `Admin@123`

**Note**: In demo mode (without database), this account is pre-configured in memory.

---

## 💻 Development Guidelines

### Code Organization

1. **Controllers** (`backend/controllers/`):
   - Handle HTTP requests
   - Validate input using schemas from `shared/schemas/`
   - Call services for business logic
   - Return standardized responses

2. **Services** (`backend/services/`):
   - Contain business logic
   - Interact with models/databases
   - Handle external API calls
   - Should be testable independently

3. **Models** (`backend/models/`):
   - Define data structures
   - Database schemas (Prisma/Mongoose)
   - No business logic

4. **API Routes** (`app/api/`):
   - Thin layer that receives requests
   - Calls appropriate controllers
   - Returns HTTP responses

### Adding a New Feature

#### Example: Adding a "Reports" Feature

1. **Create Controller** (`backend/controllers/reportController.js`):
```javascript
export async function getReportsController(userId, filters) {
  // Validation and business logic
}
```

2. **Create Service** (`backend/services/reportService.js`):
```javascript
export async function generateReport(data) {
  // Business logic
}
```

3. **Create Model** (if needed) (`backend/models/report.js`):
```javascript
// Mongoose/Prisma schema
```

4. **Create API Route** (`app/api/reports/route.js`):
```javascript
import { getReportsController } from "@/backend/controllers/reportController"

export async function GET(request) {
  const result = await getReportsController(...)
  return NextResponse.json(result)
}
```

5. **Create Frontend Component** (`components/reports/ReportList.jsx`):
```javascript
// React component for UI
```

### Naming Conventions

- **Files**: camelCase for JavaScript files (`authController.js`)
- **Components**: PascalCase for React components (`LoginForm.jsx`)
- **Functions**: camelCase (`getUserByEmail`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Directories**: lowercase with hyphens (`auth-controller/`)

### Import Paths

- **Backend**: Use relative paths or `@/backend/*` (if configured)
- **Frontend**: Use `@/components/*` for Next.js components
- **Shared**: Use relative paths from `shared/`

---

## 👥 Team Collaboration

### Team Responsibilities

#### 🔵 Backend Team
**Primary Focus**: `backend/` directory (excluding chatbot/blockchain)

**Responsibilities**:
- Authentication and authorization
- Document management APIs
- Database operations
- API endpoint development
- Business logic implementation

**Key Files**:
- `backend/controllers/` (except chatbot/blockchain)
- `backend/services/` (except chatbot/blockchain)
- `backend/models/`
- `backend/config/`

#### 🤖 Chatbot Team
**Primary Focus**: Chatbot functionality

**Responsibilities**:
- LLM integration (OpenAI, Anthropic, etc.)
- Conversation management
- Prompt engineering
- Chatbot UI components

**Key Files**:
- `backend/services/chatbot/`
- `backend/controllers/chatbot/`
- `backend/models/chatbot/`
- `backend/utils/chatbot/`
- `frontend/src/components/chatbot/`

#### ⛓️ Blockchain Team
**Primary Focus**: Blockchain integration

**Responsibilities**:
- Blockchain provider integration (Ethereum, IPFS, etc.)
- Smart contract interactions
- Document hash storage
- Verification systems

**Key Files**:
- `backend/services/blockchain/`
- `backend/controllers/blockchain/`
- `backend/models/blockchain/`
- `backend/utils/blockchain/`
- `frontend/src/components/blockchain/`

#### 🎨 Frontend Team
**Primary Focus**: User interface and experience

**Responsibilities**:
- React component development
- UI/UX implementation
- Frontend state management
- API integration on frontend

**Key Files**:
- `app/` (pages and layouts)
- `components/`
- `frontend/src/components/`
- `frontend/src/pages/`

### Collaboration Best Practices

1. **Communication**:
   - Use clear commit messages
   - Document API changes
   - Update this README when adding new features

2. **Branch Strategy**:
   - Create feature branches: `feature/team-name/feature-name`
   - Example: `feature/chatbot/llm-integration`

3. **Code Reviews**:
   - All code must be reviewed before merging
   - Test your changes locally before pushing

4. **Dependencies**:
   - Coordinate when adding new dependencies
   - Update `package.json` with clear descriptions

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Professional login (email/password).

**Request Body**:
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "role": "Doctor",
    "fullName": "Dr. John Doe",
    "email": "doctor@example.com"
  }
}
```

#### POST `/api/auth/signup`
User registration.

**Request Body**:
```json
{
  "role": "Doctor",
  "fullName": "Dr. John Doe",
  "email": "doctor@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "license": "MD123456"
}
```

#### POST `/api/auth/otp/send`
Send OTP to patient's phone.

**Request Body**:
```json
{
  "phone": "+1234567890"
}
```

#### POST `/api/auth/otp/verify`
Verify OTP and login patient.

**Request Body**:
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Document Endpoints

#### GET `/api/documents`
Get list of documents.

**Query Parameters**:
- `patientId` (optional): Filter by patient ID
- `uploadedBy` (optional): Filter by uploader ID

#### POST `/api/documents`
Create a new document record.

**Request Body**:
```json
{
  "patientId": "patient-id",
  "uploadedBy": "user-id",
  "fileName": "lab-report.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "metadata": {
    "type": "lab_report",
    "date": "2024-01-15"
  },
  "tags": ["lab", "blood-test"]
}
```

#### GET `/api/documents/[id]`
Get a specific document by ID.

#### PATCH `/api/documents/[id]`
Update document metadata.

#### DELETE `/api/documents/[id]`
Soft delete a document (sets status to "deleted").

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI (via shadcn/ui)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Type Safety**: TypeScript 5.0

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ODM**: Mongoose 9.1 (MongoDB)
- **Validation**: Zod 3.25
- **Authentication**: bcryptjs 3.0
- **SMS**: Twilio 5.12

### Databases
- **Database**: MongoDB 7.0 (via Mongoose)

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git

### Future Integrations
- **LLM Providers**: OpenAI, Anthropic (for chatbot)
- **Blockchain**: Ethereum, IPFS (for document storage)

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migrations)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
```

---

## 🔒 Security Considerations

- Passwords are hashed using bcryptjs
- OTP codes expire after 5 minutes
- OTP resend cooldown: 60 seconds
- Role-based access control enforced
- Input validation using Zod schemas
- Environment variables for sensitive data

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the coding guidelines
3. Test thoroughly
4. Submit a pull request with a clear description
5. Address code review feedback

---

## 📞 Support

For questions or issues, please contact the project maintainer or create an issue in the repository.

---

<div align="center">

**Built with ❤️ for secure medical document management**

</div>
