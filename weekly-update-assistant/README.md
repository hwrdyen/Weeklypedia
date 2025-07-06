# Weekly Update Assistant

An AI-powered application that automatically generates weekly progress emails from your GitHub activity. Built with Next.js, Supabase, and Google Gemini AI.

## Features

- **GitHub Integration**: Connect your GitHub repositories and automatically fetch commits and pull requests
- **AI-Powered Analysis**: Use Google Gemini AI to analyze your work and generate human-readable achievements
- **Interactive Review**: Edit, add, or remove achievements before generating the final email
- **Professional Email Generation**: Create polished weekly update emails suitable for managers and stakeholders
- **GitHub OAuth**: Secure authentication with GitHub

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini Pro
- **GitHub API**: Octokit.js
- **UI Components**: Radix UI, Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18.18.0 or later
- A GitHub account
- A Google Cloud account (for Gemini AI API)
- A Supabase account

### 2. Clone the Repository

```bash
git clone <repository-url>
cd weekly-update-assistant
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. In Supabase Dashboard, go to Authentication > Providers
5. Enable GitHub OAuth provider
6. Add your GitHub OAuth app credentials (see next step)

### 5. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
3. Copy the Client ID and Client Secret to your Supabase GitHub provider settings
4. Also add them to your `.env.local`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 6. Google Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local`:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 7. Additional Environment Variables

Add these to your `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

Generate a random secret key:

```bash
openssl rand -base64 32
```

### 8. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign In**: Click "Sign in with GitHub" to authenticate
2. **Configure**: Set your date range and GitHub repository URL
3. **Add Context**: Optionally add specific PR URLs or additional notes
4. **Analyze**: Click "Analyze & Generate Achievements" to fetch GitHub data and generate achievements with AI
5. **Review**: Edit, add, or remove achievements as needed
6. **Generate Email**: Create your final weekly update email
7. **Copy**: Copy the email to your clipboard and send it to your manager

## Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect your GitHub account to [Vercel](https://vercel.com)
3. Import your forked repository
4. Add all environment variables from your `.env.local` to Vercel's environment settings
5. Update your GitHub OAuth app and Supabase settings to use your production URL
6. Deploy!

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js applications.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication callbacks
│   └── page.tsx       # Main application page
├── components/
│   └── ui/            # Reusable UI components
└── lib/
    ├── ai.ts          # Google Gemini AI integration
    ├── github.ts      # GitHub API integration
    ├── supabase.ts    # Supabase configuration
    └── utils.ts       # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.
