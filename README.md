# 📝 Weekly Update Assistant

## 🚀 What is Weekly Update Assistant?

**Weekly Update Assistant** is a smart web application that automatically generates professional weekly progress emails for software engineers and technical professionals. Instead of spending time manually writing updates for managers and stakeholders, you can connect your GitHub repository, let AI analyze your work, and generate a polished email in plain language that non-technical audiences can easily understand.

## ✨ Key Features

### 📊 **Smart Analysis**

- **GitHub Integration**: Connects to your repositories to analyze commits and pull requests
- **AI-Powered Insights**: Uses Google Gemini Pro to extract meaningful achievements from your code
- **Date Range Filtering**: Analyze work from any specific time period
- **Context-Aware**: Understands your coding patterns and project structure

### 🔧 **Flexible Input Options**

- **Repository Analysis**: Automatically scan your GitHub repositories
- **Specific PR Links**: Highlight important pull requests
- **Document Upload**: Add context with PDFs, notes, and documentation
- **Manual Additions**: Include achievements not captured by automated analysis

### ✏️ **Interactive Review & Editing**

- **Achievement Curation**: Check/uncheck items to include in your email
- **Text Editing**: Customize how your achievements are described
- **Manual Additions**: Add work that wasn't automatically detected
- **Real-time Preview**: See how your email will look before generating

### 📧 **Professional Email Generation**

- **Non-Technical Language**: Converts technical jargon into clear, business-friendly language
- **Professional Tone**: Maintains a friendly yet professional communication style
- **Structured Format**: Organized with clear sections and bullet points
- **Copy-to-Clipboard**: Easy sharing with one click

## 🔍 How It Works

1. **🔐 Sign In**: Authenticate with GitHub to access your repositories
2. **📅 Set Date Range**: Choose the time period for your weekly update
3. **🔗 Connect Repository**: Provide your GitHub repository URL
4. **📎 Add Context** (Optional): Upload documents or add additional notes
5. **🤖 AI Analysis**: Let AI analyze your commits, PRs, and context
6. **✅ Review & Edit**: Customize the generated list of achievements
7. **📧 Generate Email**: Create a professional email ready to send

## 🛠️ Technical Overview

### **Architecture**

- **Full-Stack TypeScript Application** built with Next.js
- **Server-Side Rendering** for optimal performance
- **API Routes** for backend functionality
- **Responsive Design** that works on all devices

### **Tech Stack**

#### **Frontend**

- **Next.js 14** - React framework with App Router
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

#### **Backend & APIs**

- **Next.js API Routes** - Serverless functions
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (GitHub OAuth)
  - Real-time subscriptions
- **GitHub API** - Repository data access via Octokit
- **Notion API** - Document integration (optional)

#### **AI & Analysis**

- **Google Gemini Pro** - Advanced language model
- **LangChain.js** - AI orchestration framework
- **@google/generative-ai** - Official Google AI SDK
- **@langchain/google-genai** - LangChain integration

#### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- npm or yarn
- GitHub account
- Supabase account (free tier available)
- Google AI Studio account (free tier available)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/WeeklyUpdateAssistant.git
   cd WeeklyUpdateAssistant/weekly-update-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**

   - Create a new Supabase project
   - Enable GitHub OAuth in Authentication settings
   - Set up your GitHub OAuth app with the correct callback URL

4. **Run the development server**

   ```bash
   npm run dev
   ```

### **Environment Setup Details**

#### **Supabase Setup**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API to get your URL and anon key
4. Enable GitHub OAuth in Authentication → Providers
5. Configure GitHub OAuth app with redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### **Google AI Setup**

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Add to your `.env.local` file

#### **GitHub OAuth Setup**

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app
3. Set Authorization callback URL to your Supabase callback URL
4. Configure the Client ID and Secret in Supabase

## 🔒 Security & Privacy

- **OAuth Authentication**: Secure GitHub integration without storing passwords
- **Token Management**: Access tokens are handled securely and can be revoked
- **Data Privacy**: Your code and repository data are processed temporarily and not stored
- **HTTPS**: All communications are encrypted in transit
- **No Long-term Storage**: Minimal user data retention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

- **Documentation**: Check the `/context` folder for detailed specifications
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
