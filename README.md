# WC Tickets 2026 - FIFA World Cup Ticket Marketplace

A modern web platform for buying and selling FIFA World Cup 2026 tickets. Built with React, TypeScript, Vite, and Supabase.

## Features

- **Browse Listings**: Search and filter tickets by match, stage, team, and venue
- **Sell Tickets**: List your tickets with detailed seat information and pricing
- **Make Offers**: Submit and negotiate offer prices with sellers
- **Escrow System**: Secure transactions with escrow protection
- **User Profiles**: Track your listings, offers, and reputation
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, Facebook OAuth)
- **UI Components**: shadcn/ui, Framer Motion for animations
- **Testing**: Vitest, Testing Library, Playwright

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Docker (for local Supabase)
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd wc-tickets-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase locally**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Start local Supabase
   supabase start
   ```

   This will output your local credentials. Save these values.

4. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your local Supabase credentials
   nano .env.local
   ```

   After running `supabase start`, update these variables:
   - `VITE_SUPABASE_URL`: Your local Supabase URL (typically `http://127.0.0.1:54321`)
   - `VITE_SUPABASE_ANON_KEY`: Your anonymous key (shown in `supabase start` output)

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Running Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run Playwright e2e tests
npm run test:e2e
```

### Building for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## Environment Variables

### Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (public, safe to expose)

⚠️ **Important**: Never commit your `.env.local` file. It's in `.gitignore` by default. Use `.env.example` as a reference for required variables.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── contexts/          # React Context providers
├── lib/               # Utility functions and configs
├── test/              # Test files (mirror of src structure)
└── App.tsx            # Root component
```

## Development Guidelines

See `AGENTS.md` for code standards, testing guidelines, and contribution rules.

## Debugging

### Supabase Issues

Check local Supabase status:
```bash
supabase status
```

View Supabase logs:
```bash
supabase logs --local
```

Access Supabase Studio (local UI):
```
http://localhost:54323
```

### Build Issues

Clear cache and rebuild:
```bash
rm -rf dist node_modules/.vite
npm run build
```

## Security

- Never commit secrets or private keys
- Use environment variables for all sensitive config
- The `.env.local` file is excluded from version control
- Only the `.env.example` file should be committed (with placeholder values)

## License

Proprietary - All rights reserved
