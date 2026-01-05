// ==========================================
// ElevenLabs Voices API Route
// ==========================================
// Returns available voices from ElevenLabs

import { NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

interface VoiceInfo {
  id: string;
  name: string;
  category: string;
  accent?: string;
  gender?: string;
  age?: string;
  previewUrl: string;
}

/**
 * GET /api/tts/voices
 * Returns list of available ElevenLabs voices
 */
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      // Return default voices if no API key
      return NextResponse.json({
        voices: getDefaultVoices(),
        isDefault: true,
      });
    }
    
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch voices:', response.status);
      return NextResponse.json({
        voices: getDefaultVoices(),
        isDefault: true,
      });
    }
    
    const data = await response.json();
    
    const voices: VoiceInfo[] = data.voices.map((voice: ElevenLabsVoice) => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      accent: voice.labels?.accent,
      gender: voice.labels?.gender,
      age: voice.labels?.age,
      previewUrl: voice.preview_url,
    }));
    
    return NextResponse.json({
      voices,
      isDefault: false,
    });
    
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({
      voices: getDefaultVoices(),
      isDefault: true,
    });
  }
}

/**
 * Returns a list of popular default ElevenLabs voices
 * Used when API key is not available or API call fails
 */
function getDefaultVoices(): VoiceInfo[] {
  return [
    {
      id: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
      category: 'premade',
      accent: 'American',
      gender: 'Female',
      age: 'Young',
      previewUrl: '',
    },
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah',
      category: 'premade',
      accent: 'American',
      gender: 'Female',
      age: 'Young',
      previewUrl: '',
    },
    {
      id: 'ErXwobaYiN019PkySvjV',
      name: 'Antoni',
      category: 'premade',
      accent: 'American',
      gender: 'Male',
      age: 'Young',
      previewUrl: '',
    },
    {
      id: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold',
      category: 'premade',
      accent: 'American',
      gender: 'Male',
      age: 'Middle Aged',
      previewUrl: '',
    },
    {
      id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      category: 'premade',
      accent: 'American',
      gender: 'Male',
      age: 'Middle Aged',
      previewUrl: '',
    },
    {
      id: 'yoZ06aMxZJJ28mfd3POQ',
      name: 'Sam',
      category: 'premade',
      accent: 'American',
      gender: 'Male',
      age: 'Young',
      previewUrl: '',
    },
    {
      id: 'jBpfuIE2acCO8z3wKNLl',
      name: 'Gigi',
      category: 'premade',
      accent: 'American',
      gender: 'Female',
      age: 'Young',
      previewUrl: '',
    },
    {
      id: 'onwK4e9ZLuTAKqWW03F9',
      name: 'Daniel',
      category: 'premade',
      accent: 'British',
      gender: 'Male',
      age: 'Middle Aged',
      previewUrl: '',
    },
  ];
}

