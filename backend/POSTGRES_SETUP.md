# PostgreSQL Database Setup Guide for VaultBank

## Step 1: Open pgAdmin

1. Launch **pgAdmin 4** from your Start menu
2. You may be prompted to set a master password (if first time)

## Step 2: Connect to PostgreSQL Server

1. In the left sidebar, expand **Servers**
2. Click on **PostgreSQL** (it might be labeled as PostgreSQL 14, 15, or 16)
3. Enter your PostgreSQL password when prompted (the password you set during PostgreSQL installation)

## Step 3: Create the VaultBank Database

### Option A: Using pgAdmin GUI

1. **Right-click** on **Databases** in the left sidebar
2. Select **Create** → **Database...**
3. In the dialog that appears:
   - **Database name**: `vaultbank`
   - **Owner**: `postgres` (default)
   - **Encoding**: `UTF8`
   - **Template**: `template0`
4. Click **Save**

### Option B: Using SQL Query Tool

1. Right-click on **PostgreSQL** server in the left sidebar
2. Select **Query Tool**
3. Paste this SQL command:
   ```sql
   CREATE DATABASE vaultbank
   WITH OWNER = postgres
   ENCODING = 'UTF8'
   CONNECTION LIMIT = -1;
   ```
4. Click the **Execute** button (▶️ icon) or press **F5**

## Step 4: Verify Database Creation

1. In the left sidebar, expand **Databases**
2. You should now see **vaultbank** in the list
3. Expand **vaultbank** → **Schemas** → **public** → **Tables**
4. It will be empty for now (tables will be created when we run migrations)

## Step 5: Test Connection

1. Right-click on **vaultbank** database
2. Select **Query Tool**
3. Run this test query:
   ```sql
   SELECT current_database(), current_user, version();
   ```
4. You should see output showing:
   - Database: `vaultbank`
   - User: `postgres`
   - PostgreSQL version

## Your Database Configuration

Based on your `.env` file, here are your connection details:

```
Host: localhost
Port: 5432
Database: vaultbank
Username: postgres
Password: postgres (or your PostgreSQL password)
```

## Next Steps

After creating the database:

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```
   This will create all the necessary tables (users, accounts, transactions, cards, etc.)

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

4. **Verify it's working:**
   - Backend should start on `http://localhost:5000`
   - Check health endpoint: `http://localhost:5000/health`

## Troubleshooting

### "Database already exists" error
If you see this error, the database is already created. You can:
- Skip to Step 5 to verify
- Or drop and recreate: `DROP DATABASE vaultbank;` then create again

### Connection refused error
- Make sure PostgreSQL service is running
- Check Windows Services for "postgresql-x64-XX" service
- Restart the service if needed

### Authentication failed
- Verify your PostgreSQL password
- Update the `DB_PASSWORD` in the `.env` file to match your actual PostgreSQL password

### Port already in use (5432)
- Another PostgreSQL instance might be running
- Check the port in PostgreSQL configuration
- Update `DB_PORT` in `.env` if using a different port

## Database Schema

Once migrations run, you'll have these tables:
- `users` - User accounts and authentication
- `accounts` - Bank accounts
- `transactions` - Transaction history
- `virtual_cards` - Virtual card details
- `deposits` - Fixed deposits
- `beneficiaries` - Saved beneficiaries
- `cibil_scores` - Credit score history
- `chat_sessions` - AI chatbot sessions
- `chat_messages` - Chat message history

You can view these in pgAdmin under:
**vaultbank** → **Schemas** → **public** → **Tables**
