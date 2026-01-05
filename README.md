# ReadRot 📖⚡

> Transform books into brain-rot style reels. Scroll through literature like TikTok.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4+-38bdf8?style=flat-square&logo=tailwindcss)

## 🎯 What is ReadRot?

ReadRot is a web app that converts any text into a vertical scrolling "reel" format, similar to TikTok or Instagram Reels. Each "reel" displays a chunk of text with:

- 🎨 Animated background visuals
- 📝 Text passage at the top
- ✨ Karaoke-style word highlighting in the center
- 🔊 Text-to-speech reading aloud
- 📱 Scroll-snap navigation

### Perfect for:
- Gen Z readers who struggle with traditional book formats
- People with ADHD who need engagement hooks
- Language learners wanting bite-sized reading practice
- Anyone who wants to consume books in a modern format

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure ElevenLabs API (for AI voice narration)
# Create a .env.local file with your API key:
echo "ELEVENLABS_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to start reading!

## 🎙️ ElevenLabs TTS Setup

ReadRot uses ElevenLabs for high-quality AI voice narration. To enable this feature:

1. **Get an API Key**:
   - Sign up at [elevenlabs.io](https://elevenlabs.io)
   - Go to Profile Settings → API Keys
   - Generate a new API key

2. **Configure the API Key**:
   Create a `.env.local` file in the project root:
   ```env
   ELEVENLABS_API_KEY=your_api_key_here
   ```

3. **Available Voices**:
   | Voice | ID | Description |
   |-------|----|----|
   | Rachel | `21m00Tcm4TlvDq8ikWAM` | Female, Young, American (Default) |
   | Adam | `pNInz6obpgDQGcFmaJgB` | Male, Deep, American |
   | Antoni | `ErXwobaYiN019PkySvjV` | Male, Young, American |
   | Sarah | `EXAVITQu4vr4xnSDxMaL` | Female, Soft, American |
   | Daniel | `onwK4e9ZLuTAKqWW03F9` | Male, British |

> **Note**: ElevenLabs has a free tier with limited characters/month. For heavy usage, consider upgrading your plan.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14+ | App Router, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Zustand | State management |
| IndexedDB (idb) | Offline storage |
| ElevenLabs | AI Text-to-speech |

## 📱 Features

### MVP (Current)
- ✅ Paste text to create books
- ✅ Vertical scroll-snap reel experience
- ✅ Animated gradient backgrounds
- ✅ Text-to-speech with word highlighting
- ✅ Save books locally (IndexedDB)
- ✅ Resume reading from last position
- ✅ Library to manage saved books

### Coming Soon
- 📁 File upload (TXT, EPUB)
- 🎬 Video backgrounds (subway surfers, etc.)
- 🎵 Background music
- ⚙️ Settings (TTS voice, speed, themes)
- 📱 PWA support

## 🎨 Design

ReadRot uses a dark theme with vibrant accent colors:

- **Primary**: Hot pink (`#ff3366`)
- **Secondary**: Cyan (`#00ffcc`)
- **Tertiary**: Gold (`#ffcc00`)

Fonts:
- Display: Clash Display
- Body: Satoshi
- Mono: JetBrains Mono

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── upload/            # Text upload page
│   ├── library/           # Saved books
│   └── read/[bookId]/     # Reading experience
├── components/
│   └── reel/              # Reel-related components
│       ├── ReelContainer.tsx
│       ├── Reel.tsx
│       ├── ReelBackground.tsx
│       ├── ReelText.tsx
│       ├── ReelHighlight.tsx
│       └── ReelControls.tsx
├── hooks/
│   ├── useTTS.ts          # Legacy Web Speech API hook
│   └── useElevenLabsTTS.ts # ElevenLabs AI voice hook
├── lib/
│   ├── chunker.ts         # Text chunking algorithm
│   └── db.ts              # IndexedDB operations
├── stores/
│   ├── useBookStore.ts    # Book state
│   └── useReaderStore.ts  # Reader settings
└── types/
    └── index.ts           # TypeScript interfaces
```

## 🧪 How It Works

1. **Text Chunking**: Your text is split into ~40-word chunks at sentence boundaries
2. **Reel Display**: Each chunk becomes a full-screen "reel" you can scroll through
3. **AI Voice**: ElevenLabs generates natural speech with word-level timestamps
4. **Karaoke Sync**: Words highlight in sync with the AI narration
5. **Progress Save**: Your position is saved automatically to IndexedDB

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs

## 📝 License

MIT

---

*Made with 🧠💀 for the scroll generation*
