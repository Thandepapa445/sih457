# sih457

A comprehensive fault reporting and maintenance management system.

## Features

- Fault report creation and management
- Status tracking (pending, in-progress, approved, assigned)
- File attachments support
- Analytics dashboard
- Priority-based workflow
- Department-wise categorization

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: SQLite with Drizzle ORM
- **UI**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query

## Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository (`https://github.com/Thandepapa445/sih457`)

2. **Configuration:**
   - Vercel should auto-detect the project as a Vite app
   - The `vercel.json` file contains the necessary configuration
   - Build command: `npm run build:vercel`
   - Output directory: `dist`

3. **Environment Variables:**
   - Add any required environment variables in Vercel dashboard
   - Database will be created automatically on first run

4. **Deploy:**
   - Click "Deploy" and wait for the build to complete
   - Your app will be available at the provided Vercel URL

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
├── api/                 # Vercel serverless functions
│   └── fault-reports/   # API endpoints
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── pages/          # Page components
│   └── lib/            # Utilities
├── server/             # Original Express server (for local dev)
├── shared/             # Shared types and schemas
└── vercel.json         # Vercel deployment config
```

## Notes

- The project includes both serverless API routes (for Vercel) and a full Express server (for local development)
- File uploads are simplified in the Vercel deployment
- Database operations use mock data in the deployed version for demonstration

