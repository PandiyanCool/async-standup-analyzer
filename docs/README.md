## Async Standup Analyzer

A Next.js application for recording and analyzing daily standup updates using Azure Speech-to-Text and OpenAI services.

### Features

- 🎤 One-click audio recording
- 📝 Real-time speech-to-text transcription
- 🤖 AI-powered standup summary generation
- 📊 Word cloud visualization
- 💾 Local storage for history
- 📋 Copy to clipboard functionality
- 💬 Slack integration

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Azure services (see [Azure Setup Guide](./azure-setup.md))
4. Create `.env.local` with required environment variables
5. Start the development server:
   ```bash
   npm run dev
   ```

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── layout/         # Layout components
│   ├── standup/        # Standup-specific components
│   └── ui/             # UI components
├── docs/               # Documentation
├── lib/                # Utility functions and types
│   ├── azure/         # Azure service integrations
│   └── types.ts       # TypeScript types
└── public/            # Static assets
```

### Development

- Built with Next.js 13+ and React 18
- Uses Tailwind CSS for styling
- Implements shadcn/ui components
- TypeScript for type safety
- ESLint and Prettier for code quality

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### License

MIT License - see LICENSE file for details