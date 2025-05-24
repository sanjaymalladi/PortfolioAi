# 🎯 AI Interview Practice Platform

An intelligent interview preparation platform powered by AI that helps job seekers practice and improve their interview skills through realistic mock interviews and personalized feedback.

## ✨ Features

### 🤖 **Dual Interview Modes**
- **Chat Interview**: Text-based Q&A with real-time feedback
- **Video Interview**: Camera-enabled practice with speech recognition

### 🧠 **AI-Powered Intelligence**
- **Dynamic Question Generation**: Questions tailored to your resume and job description
- **Contextual Follow-ups**: AI analyzes previous answers to ask relevant follow-up questions
- **Comprehensive Feedback**: Detailed analysis across multiple dimensions (clarity, relevance, STAR method, etc.)

### 🎙️ **Advanced Speech Recognition**
- **Gemini Audio Transcription**: High-quality AI-powered speech-to-text
- **Real-time Processing**: Instant transcription of your spoken responses
- **Fallback Options**: Type answers if speech recognition isn't available

### 📊 **Detailed Performance Analytics**
- **Individual Question Scoring**: Get scores and feedback for each response
- **Overall Performance Metrics**: Track improvement across multiple categories
- **Actionable Insights**: Specific recommendations for skill improvement
- **Progress Tracking**: See your development over time

### 🎨 **Modern User Experience**
- **Dark/Light Theme Support**: Comfortable viewing in any environment
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Interface**: Clean, professional design focused on usability

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme support
- **AI Integration**: Google Gemini for question generation and feedback
- **Speech Recognition**: Gemini Audio API for transcription
- **Text-to-Speech**: ElevenLabs API for natural voice synthesis
- **PDF Processing**: Client-side PDF parsing for resume upload
- **State Management**: React hooks and context
- **Routing**: React Router for navigation

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Google Gemini API Key** (for AI features)
- **Clerk Account** (for user authentication)
- **ElevenLabs API Key** (optional, for TTS)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-interview-practice.git
cd ai-interview-practice
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Required: Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Required: Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Optional: ElevenLabs API for Text-to-Speech
VITE_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVEN_LABS_VOICE_ID=voice_id_here

# Optional: D-ID API for Avatar Video (Chat mode)
VITE_DID_API_KEY=your_did_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎮 How to Use

### 1. **Sign Up/Sign In**
- Create a free account or sign in to access all features
- Authentication is required to save progress and access personalized features

### 2. **Setup Your Interview**
- Upload your resume (PDF) or paste text
- Add the job description you're preparing for
- Choose between Chat or Video interview mode

### 3. **Practice Interview**
- **Chat Mode**: Type responses and get instant feedback
- **Video Mode**: Use speech recognition or type responses

### 4. **Get Detailed Feedback**
- Receive comprehensive analysis of each answer
- View scores across multiple evaluation criteria
- Get specific improvement recommendations
- See overall performance summary

### 5. **Review & Improve**
- Study the detailed feedback report
- Practice weak areas identified by the AI
- Retake interviews to track improvement

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── InterviewChat.tsx   # Main interview component
│   ├── ChatMessage.tsx     # Message display component
│   ├── ChatInput.tsx       # Message input component
│   └── ...
├── services/           # API and service functions
│   ├── geminiService.ts    # Gemini AI integration
│   ├── interviewService.ts # Interview logic
│   └── hybridSpeechService.ts # Speech recognition
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── styles/             # Global styles
```

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### Clerk Authentication
1. Sign up at [Clerk.com](https://clerk.com/)
2. Create a new application
3. Get your Publishable Key from the dashboard
4. Add to `.env` as `VITE_CLERK_PUBLISHABLE_KEY`

### ElevenLabs API (Optional)
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from dashboard
3. Add to `.env` as `VITE_ELEVEN_LABS_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed information about your environment

## 🚀 Future Enhancements

- [ ] User authentication and profile management
- [ ] Interview history and progress tracking
- [ ] Multiple AI model support
- [ ] Custom interview question sets
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for job seekers looking to ace their interviews!**
