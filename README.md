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

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to start reading!

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14+ | App Router, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Zustand | State management |
| IndexedDB (idb) | Offline storage |
| Web Speech API | Text-to-speech |

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
│   └── useTTS.ts          # Text-to-speech hook
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
3. **TTS Sync**: Web Speech API reads aloud while highlighting words
4. **Progress Save**: Your position is saved automatically to IndexedDB

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs

## 📝 License

MIT

---

*Made with 🧠💀 for the scroll generation*
