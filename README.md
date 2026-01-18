# Design Navigator

A full-stack digital banking application with a modern React frontend and secure Node.js backend.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
design-navigator/
├── frontend/          # React + Vite + TypeScript frontend
├── backend/           # Node.js + Express + TypeScript backend
└── README.md
```

## Frontend

The frontend is a modern React application built with Vite and TypeScript.

### Technologies Used

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework

### Setup & Development

```sh
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Backend

The backend is a secure Node.js API built with Express and TypeScript, using PostgreSQL for data persistence.

### Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma** - Database ORM

### Setup & Development

```sh
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start the development server
npm run dev

# Build for production
npm run build
```

For detailed backend setup instructions, see [backend/README.md](./backend/README.md)

## Development Workflow

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd design-navigator
   ```

2. **Set up the backend**
   ```sh
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run migrate
   npm run dev
   ```

3. **Set up the frontend** (in a new terminal)
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
