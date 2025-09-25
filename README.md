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

### Vercel Deployment (SIMPLIFIED)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "New Project"**

3. **Import this repository:**
   ```
   https://github.com/Thandepapa445/sih457
   ```

4. **Vercel will auto-detect it as a Vite project**
   - Framework: Vite (auto-detected)
   - Build command: `npm run build` (auto-detected)
   - Output directory: `dist` (auto-detected)
   - Install command: `npm install` (auto-detected)

5. **Click "Deploy"**
   - No additional configuration needed!
   - The build has been tested locally and works
   - Simple API endpoint available at `/api/hello`

**That's it!** Your app will be live in ~2 minutes.

### Current Status

✅ **Ready for Deployment!**
- Build tested locally and works perfectly
- All Replit-specific code removed
- Simplified configuration for maximum compatibility
- Frontend will deploy as a static site
- API endpoints available as serverless functions

⚠️ **Note:** The deployed version uses mock data for demonstration. The full database functionality is available when running locally with `npm run dev`.

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

