// ==========================================
// ReadRot Type Definitions
// ==========================================

/**
 * Represents a single chunk of text to display in a reel
 * Each chunk is 2-4 sentences meant to be read in one "scroll"
 */
export interface Chunk {
  id: number;                    // Index in the book's chunk array
  text: string;                  // Full chunk text (2-4 sentences)
  words: string[];               // Split words for karaoke-style highlighting
  startPosition: number;         // Character position where chunk starts in original text
  endPosition: number;           // Character position where chunk ends
}

/**
 * Per-book settings that can be customized
 */
export interface BookSettings {
  backgroundId: string;          // Which background video to use
  musicId?: string;              // Optional background music track
  ttsVoice?: string;             // Selected TTS voice name (legacy Web Speech API)
  ttsVoiceId?: string;           // ElevenLabs voice ID
  ttsSpeed: number;              // Speech rate: 0.5 - 2.0
  wordsPerChunk: number;         // Target words per chunk (default: 30-50)
}

/**
 * ElevenLabs voice information
 */
export interface ElevenLabsVoice {
  id: string;                    // Voice ID from ElevenLabs
  name: string;                  // Display name
  category: string;              // Voice category (premade, cloned, etc.)
  accent?: string;               // Voice accent (American, British, etc.)
  gender?: string;               // Voice gender
  age?: string;                  // Voice age group
  previewUrl?: string;           // URL to voice preview audio
}

/**
 * Word timing for karaoke-style highlighting
 */
export interface WordTiming {
  word: string;                  // The word text
  start: number;                 // Start time in milliseconds
  end: number;                   // End time in milliseconds
}

/**
 * A book stored in the user's library
 */
export interface Book {
  id: string;                    // UUID for the book
  title: string;                 // User-provided or extracted title
  author?: string;               // Optional author name
  text: string;                  // Full original text
  chunks: Chunk[];               // Pre-processed chunks for display
  createdAt: number;             // Unix timestamp when added
  lastReadAt?: number;           // Unix timestamp when last opened
  lastChunkIndex: number;        // Index to resume reading from
  settings: BookSettings;        // Per-book customization
}

/**
 * Global app settings
 */
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultBackground: string;     // Default background video ID
  defaultMusic: string;          // Default music track ID
  ttsEnabled: boolean;           // Whether TTS is on by default
  musicEnabled: boolean;         // Whether background music plays
  musicVolume: number;           // 0 to 1
  ttsVolume: number;             // 0 to 1
  autoPlay: boolean;             // Auto-start TTS when scrolling to new reel
  hapticFeedback: boolean;       // Vibrate on scroll (mobile)
}

/**
 * Background video asset metadata
 */
export interface Background {
  id: string;
  name: string;
  videoUrl: string;
  thumbnail: string;
  category: 'gaming' | 'asmr' | 'satisfying' | 'nature' | 'abstract';
}

/**
 * Music track metadata
 */
export interface MusicTrack {
  id: string;
  name: string;
  audioUrl: string;
  duration: number;              // Duration in seconds
  mood: 'chill' | 'focus' | 'energetic';
}

/**
 * Options for the text chunking algorithm
 */
export interface ChunkOptions {
  targetWords?: number;          // Target words per chunk (default: 40)
  maxWords?: number;             // Maximum words allowed (default: 60)
  minWords?: number;             // Minimum words required (default: 20)
  preserveParagraphs?: boolean;  // Try to keep paragraphs together
}

/**
 * Default settings for new books
 */
export const DEFAULT_BOOK_SETTINGS: BookSettings = {
  backgroundId: 'gradient',
  ttsSpeed: 1.0,
  wordsPerChunk: 40,
};

/**
 * Default app settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultBackground: 'gradient',
  defaultMusic: 'none',
  ttsEnabled: true,
  musicEnabled: false,
  musicVolume: 0.3,
  ttsVolume: 1.0,
  autoPlay: true,
  hapticFeedback: true,
};

