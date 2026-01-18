# Design Navigator - Frontend

Modern React frontend for the Design Navigator digital banking application.

## Technologies

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **Vitest** - Unit testing framework

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or bun package manager

### Installation

```sh
# Install dependencies
npm install

# Or using bun
bun install
```

### Development

```sh
# Start the development server
npm run dev

# The app will be available at http://localhost:5173
```

### Building

```sh
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```sh
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and libraries
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Public static assets
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code with ESLint

## Environment Variables

Create a `.env` file in the frontend directory if you need to configure environment-specific variables:

```env
VITE_API_URL=http://localhost:3000
```

## Component Library

This project uses [shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```sh
npx shadcn-ui@latest add [component-name]
```

## Styling

The project uses Tailwind CSS for styling. The configuration can be found in `tailwind.config.ts`.

Custom theme colors and design tokens are defined in the Tailwind config.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Your License Here]
