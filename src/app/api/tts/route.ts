// ==========================================
// ElevenLabs TTS API Route
// ==========================================
// Server-side endpoint to generate speech with word timestamps
// Keeps API key secure on the server

import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default voice ID (Rachel - clear female voice, good for reading)
// You can change this to any voice from your ElevenLabs account
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface ElevenLabsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
}

interface WordTiming {
  word: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
}

/**
 * POST /api/tts
 * Generates speech from text using ElevenLabs API with word-level timestamps
 * 
 * Request body:
 * - text: string - The text to convert to speech
 * - voiceId?: string - Optional voice ID (defaults to Rachel)
 * - speed?: number - Speech speed multiplier (0.5 - 2.0)
 * 
 * Response:
 * - audioBase64: string - Base64 encoded MP3 audio
 * - wordTimings: WordTiming[] - Array of word timings for karaoke effect
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY is not configured');
      return NextResponse.json(
        { error: 'TTS service is not configured. Please add ELEVENLABS_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { text, voiceId = DEFAULT_VOICE_ID, speed = 1.0 } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Call ElevenLabs API with timestamps
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Best quality model
          voice_settings: {
            stability: 0.5,        // Natural variation
            similarity_boost: 0.75, // Voice consistency
            style: 0.0,            // Neutral style
            use_speaker_boost: true,
          },
          // Speed adjustment (if supported by model)
          ...(speed !== 1.0 && { speed }),
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }
    
    const data: ElevenLabsResponse = await response.json();
    
    // Convert character-level timings to word-level timings
    const wordTimings = extractWordTimings(
      data.alignment.characters,
      data.alignment.character_start_times_seconds,
      data.alignment.character_end_times_seconds
    );
    
    return NextResponse.json({
      audioBase64: data.audio_base64,
      wordTimings,
    });
    
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Converts character-level timings from ElevenLabs to word-level timings
 * Groups characters into words based on spaces and punctuation
 */
function extractWordTimings(
  characters: string[],
  startTimes: number[],
  endTimes: number[]
): WordTiming[] {
  const wordTimings: WordTiming[] = [];
  let currentWord = '';
  let wordStart = 0;
  let wordEnd = 0;
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const startTime = startTimes[i];
    const endTime = endTimes[i];
    
    // Check if this is a word boundary (space or end of text)
    if (char === ' ' || char === '\n' || char === '\t') {
      if (currentWord.length > 0) {
        wordTimings.push({
          word: currentWord,
          start: Math.round(wordStart * 1000), // Convert to milliseconds
          end: Math.round(wordEnd * 1000),
        });
        currentWord = '';
      }
    } else {
      // Start of a new word
      if (currentWord.length === 0) {
        wordStart = startTime;
      }
      currentWord += char;
      wordEnd = endTime;
    }
  }
  
  // Don't forget the last word
  if (currentWord.length > 0) {
    wordTimings.push({
      word: currentWord,
      start: Math.round(wordStart * 1000),
      end: Math.round(wordEnd * 1000),
    });
  }
  
  return wordTimings;
}

