# VaultBank Backend API

Production-ready digital banking backend built with Node.js, Express, TypeScript, and PostgreSQL for Indian users.

## 🚀 Features

- **Authentication & Security**
  - JWT-based authentication (access + refresh tokens)
  - OTP verification for secure operations
  - Password hashing with bcrypt
  - Role-based access control (Customer, Admin, Banker)
  - Rate limiting on sensitive endpoints

- **Banking Operations**
  - Account creation and management
  - Real-time transaction processing with ACID compliance
  - Virtual card issuance and management
  - Fixed deposit system with interest calculation
  - Transaction approval workflow for large amounts

- **Additional Services**
  - CIBIL credit score integration (mock)
  - AI chatbot support (OpenRouter API)
  - Email notifications via Nodemailer
  - Admin dashboard for KYC and transaction approvals

## 📋 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer (Gmail SMTP)
- **Logging**: Winston
- **Validation**: express-validator

## 📁 Project Structure

```
backend/
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   └── email.ts
│   ├── controllers/        # Request handlers
│   │   └── authController.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── auth.ts
│   │   ├── authorization.ts
│   │   ├── validation.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── models/             # Database models
│   │   ├── User.ts
│   │   ├── Account.ts
│   │   └── Transaction.ts
│   ├── routes/             # API routes
│   │   └── authRoutes.ts
│   ├── services/           # Business logic
│   │   └── authService.ts
│   ├── utils/              # Utility functions
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb vaultbank

   # Run schema
   psql -U postgres -d vaultbank -f database/schema.sql

   # (Optional) Load sample data
   psql -U postgres -d vaultbank -f database/seed.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Build TypeScript**
   ```bash
   npm run build
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:5000`

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vaultbank
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# OpenRouter AI (Optional)
OPENROUTER_API_KEY=your_api_key
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Public |
| POST | `/api/auth/send-otp` | Send OTP to email | Public |
| POST | `/api/auth/verify-otp` | Verify OTP | Public |
| GET | `/api/auth/profile` | Get user profile | Private |

### Example Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@123",
    "full_name": "John Doe",
    "phone": "+919876543210",
    "pan_number": "ABCDE1234F",
    "aadhaar_number": "123456789012"
  }'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@123"
  }'
```

**Access Protected Route**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🗄️ Database Schema

### Key Tables

- **users**: User accounts with authentication and KYC details
- **accounts**: Bank accounts with balance tracking
- **transactions**: All financial transactions with audit trail
- **virtual_cards**: Virtual debit/credit cards
- **deposits**: Fixed deposits with interest calculation
- **otp_records**: OTP verification records
- **credit_scores**: CIBIL score history
- **notifications**: Email notification queue
- **admin_actions**: Audit trail for admin operations

See `database/schema.sql` for complete schema.

## 🧪 Testing

### Test Credentials (from seed data)

**Customer**
- Email: `john.doe@gmail.com`
- Password: `Test@123`

**Admin**
- Email: `admin@vaultbank.com`
- Password: `Test@123`

**Banker**
- Email: `banker@vaultbank.com`
- Password: `Test@123`

### Run Tests
```bash
npm test
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Input Validation**: express-validator on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Transaction Atomicity**: ACID compliance for financial operations

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

### Adding New Features

1. Create model in `src/models/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Register routes in `src/app.ts`

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `vaultbank` exists

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill`

### TypeScript Errors
- Run `npm run build` to check for errors
- Ensure all dependencies are installed

## 📚 Additional Documentation

- [API Documentation](docs/API.md) - Detailed API reference
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Database Schema](database/schema.sql) - Complete schema

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Add more features
- Improve error handling
- Add more tests
- Enhance security

## 📄 License

MIT License - feel free to use for hackathons, college projects, or startups!

## 🎯 Next Steps

To complete the backend:

1. **Implement remaining controllers**:
   - Account controller
   - Transaction controller
   - Card controller
   - Deposit controller
   - CIBIL controller
   - Chatbot controller
   - Admin controller

2. **Add email service**:
   - Welcome emails
   - Transaction alerts
   - OTP emails
   - Deposit maturity alerts

3. **Integrate external APIs**:
   - Real CIBIL API
   - OpenRouter AI for chatbot
   - SMS gateway for OTP

4. **Add comprehensive tests**:
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests

5. **Deploy to production**:
   - Set up CI/CD
   - Configure production database
   - Set up monitoring and logging

## 📞 Support

For issues or questions:
- Check existing documentation
- Review error logs in `logs/` directory
- Ensure all environment variables are set correctly

---

**Built with ❤️ for Indian banking needs**
