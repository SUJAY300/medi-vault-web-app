# MediVault - Medical Document Management System

A comprehensive, role-based medical document management system with AI-powered chatbot and blockchain-based document storage.

## Project Structure

This project follows an MVC (Model-View-Controller) architecture with clear separation of concerns:

```
medi-vault-web-app/
├── backend/              # Backend logic (MVC structure)
│   ├── config/          # Configuration files (DB, Twilio, etc.)
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── routes/          # Route definitions (if using Express)
│   ├── middlewares/     # Middleware functions
│   └── utils/           # Utility functions
│
├── frontend/            # Frontend React/Next.js application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API client functions
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Frontend utilities
│   └── public/          # Static assets
│
├── shared/              # Shared code between backend and frontend
│   ├── schemas/        # Validation schemas (Zod)
│   ├── types/          # TypeScript types
│   └── utils/          # Shared utilities
│
└── app/                 # Next.js App Router (API routes and pages)
    ├── api/            # Next.js API routes (thin layer, delegates to controllers)
    ├── auth/           # Auth pages
    └── dashboard/      # Dashboard pages
```

## Features

- **Authentication**: Email/password for professionals, OTP for patients
- **Role-Based Access**: Admin, Doctor, Nurse, Student, Patient
- **Document Management**: Upload, organize, and manage medical documents
- **Chatbot**: AI-powered assistant (to be implemented)
- **Blockchain Storage**: Secure document storage on blockchain (to be implemented)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for MySQL and MongoDB)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start databases:
```bash
docker-compose up -d
```

3. Set up environment variables (create `.env.local`):
```env
DATABASE_URL="mysql://medivault:medivault@localhost:3306/medivault"
MONGODB_URI="mongodb://localhost:27017/medivault"
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

4. Initialize database:
```bash
npm run db:push
npm run db:seed
```

5. Run development server:
```bash
npm run dev
```

## Demo Credentials

- Email: `admin@medivault.com`
- Password: `Admin@123`

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma, Mongoose
- **Databases**: MySQL 8, MongoDB 7
- **Authentication**: bcryptjs, Twilio (SMS OTP)

## Development

### Project Organization

- **Backend Team**: Works in `backend/` folder
- **Frontend Team**: Works in `frontend/src/` folder
- **Chatbot Team**: Works in `backend/services/chatbot/` and `backend/controllers/chatbot/`
- **Blockchain Team**: Works in `backend/services/blockchain/` and `backend/controllers/blockchain/`

### Adding New Features

1. Create controller in `backend/controllers/`
2. Create service in `backend/services/`
3. Create model in `backend/models/` if needed
4. Add API route in `app/api/` that calls the controller
5. Create frontend component in `frontend/src/components/`

## License

Private
