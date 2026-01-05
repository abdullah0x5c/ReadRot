// ==========================================
// Text Chunking Algorithm
// ==========================================
// Splits book text into bite-sized chunks for the reel format
// Each chunk should be readable in one "scroll" (2-4 sentences)

import { Chunk, ChunkOptions } from '@/types';

/**
 * Default chunking options
 */
const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  targetWords: 40,
  maxWords: 60,
  minWords: 20,
  preserveParagraphs: true,
};

/**
 * Splits text into sentences using common sentence boundaries
 * Handles common abbreviations to avoid false splits
 */
function splitIntoSentences(text: string): string[] {
  // Common abbreviations that shouldn't end sentences
  const abbreviations = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'i.e', 'e.g'];
  
  // Protect abbreviations by replacing their periods temporarily
  let protectedText = text;
  abbreviations.forEach((abbr, index) => {
    const regex = new RegExp(`\\b${abbr}\\.`, 'gi');
    protectedText = protectedText.replace(regex, `${abbr}__PROTECTED${index}__`);
  });
  
  // Split on sentence-ending punctuation followed by space and capital letter
  // or end of string
  const sentenceRegex = /[.!?]+(?=\s+[A-Z]|\s*$)/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = sentenceRegex.exec(protectedText)) !== null) {
    const sentence = protectedText.slice(lastIndex, match.index + match[0].length).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }
  
  // Don't forget the last part if there's no ending punctuation
  const remaining = protectedText.slice(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }
  
  // Restore protected abbreviations
  return sentences.map(sentence => {
    let restored = sentence;
    abbreviations.forEach((abbr, index) => {
      restored = restored.replace(new RegExp(`${abbr}__PROTECTED${index}__`, 'g'), `${abbr}.`);
    });
    return restored;
  });
}

/**
 * Counts words in a string
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Splits text into words, preserving punctuation attached to words
 */
function splitIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}

/**
 * Main chunking function
 * Converts full book text into an array of chunks suitable for reel display
 * 
 * @param text - The full book text to chunk
 * @param options - Chunking configuration options
 * @returns Array of Chunk objects ready for display
 */
export function chunkText(text: string, options?: ChunkOptions): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: Chunk[] = [];
  
  // Normalize whitespace and clean up text
  const cleanedText = text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Max 2 newlines
    .replace(/[ \t]+/g, ' ')          // Normalize spaces
    .trim();
  
  // Split into paragraphs first if preserving them
  const paragraphs = opts.preserveParagraphs 
    ? cleanedText.split(/\n\n+/)
    : [cleanedText];
  
  let currentChunkSentences: string[] = [];
  let currentWordCount = 0;
  let currentStartPosition = 0;
  let chunkId = 0;
  
  for (const paragraph of paragraphs) {
    const sentences = splitIntoSentences(paragraph.trim());
    
    for (const sentence of sentences) {
      const sentenceWordCount = countWords(sentence);
      
      // If adding this sentence would exceed max words, finalize current chunk
      if (currentWordCount + sentenceWordCount > opts.maxWords && currentChunkSentences.length > 0) {
        const chunkText = currentChunkSentences.join(' ');
        chunks.push({
          id: chunkId++,
          text: chunkText,
          words: splitIntoWords(chunkText),
          startPosition: currentStartPosition,
          endPosition: currentStartPosition + chunkText.length,
        });
        currentStartPosition += chunkText.length + 1;
        currentChunkSentences = [];
        currentWordCount = 0;
      }
      
      // Add sentence to current chunk
      currentChunkSentences.push(sentence);
      currentWordCount += sentenceWordCount;
      
      // If we've reached target words, finalize chunk
      if (currentWordCount >= opts.targetWords) {
        const chunkText = currentChunkSentences.join(' ');
        chunks.push({
          id: chunkId++,
          text: chunkText,
          words: splitIntoWords(chunkText),
          startPosition: currentStartPosition,
          endPosition: currentStartPosition + chunkText.length,
        });
        currentStartPosition += chunkText.length + 1;
        currentChunkSentences = [];
        currentWordCount = 0;
      }
    }
    
    // At paragraph boundary, consider finalizing if we have enough words
    if (opts.preserveParagraphs && currentWordCount >= opts.minWords) {
      const chunkText = currentChunkSentences.join(' ');
      chunks.push({
        id: chunkId++,
        text: chunkText,
        words: splitIntoWords(chunkText),
        startPosition: currentStartPosition,
        endPosition: currentStartPosition + chunkText.length,
      });
      currentStartPosition += chunkText.length + 1;
      currentChunkSentences = [];
      currentWordCount = 0;
    }
  }
  
  // Don't forget any remaining text
  if (currentChunkSentences.length > 0) {
    const chunkText = currentChunkSentences.join(' ');
    chunks.push({
      id: chunkId++,
      text: chunkText,
      words: splitIntoWords(chunkText),
      startPosition: currentStartPosition,
      endPosition: currentStartPosition + chunkText.length,
    });
  }
  
  return chunks;
}

/**
 * Estimates reading time for a chunk in milliseconds
 * Based on average reading speed of ~200 words per minute
 */
export function estimateReadingTime(chunk: Chunk, wordsPerMinute = 200): number {
  return (chunk.words.length / wordsPerMinute) * 60 * 1000;
}

/**
 * Calculates total book reading time
 */
export function estimateTotalReadingTime(chunks: Chunk[], wordsPerMinute = 200): number {
  return chunks.reduce((total, chunk) => total + estimateReadingTime(chunk, wordsPerMinute), 0);
}

