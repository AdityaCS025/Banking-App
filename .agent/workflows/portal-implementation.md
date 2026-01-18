---
description: VaultBank Portal Implementation Plan
---

# VaultBank Portal Implementation Plan

## Architecture Overview

### Modular Structure
```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   ├── customer/
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   ├── Transactions.tsx
│   │   ├── Cards.tsx
│   │   ├── Deposits.tsx
│   │   ├── Transfer.tsx
│   │   ├── Profile.tsx
│   │   └── CibilScore.tsx
│   ├── banker/
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── Accounts.tsx
│   │   ├── Verification.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   └── Index.tsx (Landing)
├── components/
│   ├── layouts/
│   │   ├── CustomerLayout.tsx
│   │   ├── BankerLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── customer/
│   │   ├── AccountCard.tsx
│   │   ├── TransactionList.tsx
│   │   ├── QuickActions.tsx
│   │   └── ...
│   └── banker/
│       ├── CustomerTable.tsx
│       ├── VerificationQueue.tsx
│       └── ...
└── lib/
    ├── auth.ts
    ├── api.ts
    └── types.ts
```

## Phase 1: Enhanced Registration (Indian Banking Standards)

### Account Types (As per RBI Guidelines)
1. **Savings Account**
   - Minimum balance: ₹10,000
   - Interest rate: 3.5% p.a.
   - Free transactions: 5/month
   
2. **Current Account**
   - Minimum balance: ₹25,000
   - No interest
   - Unlimited transactions
   - For businesses

3. **Fixed Deposit**
   - Minimum: ₹10,000
   - Tenure: 7 days to 10 years
   - Interest: 5.5% - 7.5% p.a.
   - Premature withdrawal penalty

### KYC Requirements (Indian Standards)
- PAN Card (Mandatory)
- Aadhaar Card
- Address Proof
- Photograph
- Signature

### Disclaimer Sections
1. Terms & Conditions
2. Privacy Policy
3. DICGC Insurance (₹5 lakh coverage)
4. RBI Guidelines Compliance
5. Anti-Money Laundering (AML) Policy

## Phase 2: Customer Portal Pages

### 1. Dashboard
- Account summary
- Recent transactions
- Quick actions
- CIBIL score widget
- Virtual cards overview

### 2. Accounts
- All accounts list
- Account statements
- Download statements (PDF)
- Account details

### 3. Transactions
- Transaction history
- Filter by date/type
- Search transactions
- Export to Excel/PDF

### 4. Cards
- Virtual card management
- Create new cards
- Freeze/Unfreeze
- Set limits
- Transaction history

### 5. Deposits
- FD/RD management
- Create new deposits
- Maturity calculator
- Interest earned

### 6. Transfer
- NEFT/RTGS/IMPS
- UPI payments
- Add beneficiary
- Transaction limits

### 7. Profile
- Personal information
- KYC documents
- Linked accounts
- Security settings

### 8. CIBIL Score
- Credit score tracking
- Score improvement tips
- Credit report download

## Phase 3: Banker Portal Pages

### 1. Dashboard
- Daily statistics
- Pending verifications
- Recent activities
- Performance metrics

### 2. Customers
- Customer list
- Search/Filter
- Customer details
- Account history

### 3. Accounts
- All accounts overview
- Account verification
- Freeze/Unfreeze accounts
- Transaction monitoring

### 4. Verification
- KYC verification queue
- Document verification
- Approve/Reject accounts
- Compliance checks

### 5. Reports
- Daily reports
- Monthly statements
- Audit logs
- Export reports

### 6. Settings
- Banker profile
- Branch details
- System settings

## Implementation Order

1. ✅ Landing Page
2. ✅ Login/Signup (Basic)
3. 🔄 Enhanced Signup (Account types, KYC, Disclaimers)
4. 🔄 Customer Portal Layout
5. 🔄 Customer Portal Pages
6. 🔄 Banker Portal Layout
7. 🔄 Banker Portal Pages
8. 🔄 API Integration
9. 🔄 Testing & Refinement

## Indian Banking Compliance

### RBI Guidelines
- Know Your Customer (KYC) norms
- Anti-Money Laundering (AML)
- FATCA/CRS compliance
- DICGC insurance disclosure

### Security Standards
- Two-factor authentication
- OTP verification
- Session management
- Encryption (SSL/TLS)

### Transaction Limits (As per RBI)
- NEFT: No limit
- RTGS: Minimum ₹2 lakh
- IMPS: ₹5 lakh/transaction
- UPI: ₹1 lakh/transaction
