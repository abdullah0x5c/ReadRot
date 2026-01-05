'use client';

// ==========================================
// Upload Page
// ==========================================
// Where users paste their text to create a new book

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookStore } from '@/stores/useBookStore';
import { chunkText } from '@/lib/chunker';

// Sample text for demo purposes
const SAMPLE_TEXT = `The old man sat alone in the dimly lit café, watching the rain trace patterns down the window. He had been coming here for forty years, always to the same corner table, always ordering the same black coffee that grew cold as his thoughts wandered.

Outside, the city moved with its usual indifference. Umbrellas bloomed like dark flowers. Cars splashed through puddles. People hurried past, faces hidden, lives unknown. The old man watched them all, wondering about their stories, their secrets, their dreams.

He remembered when he was young and full of fire. When every day was an adventure waiting to happen. When love was a wild thing that couldn't be tamed. Now those days felt like photographs from someone else's life.

But today was different. Today, he had received a letter. The handwriting was familiar – elegant curves that time hadn't changed. After thirty years of silence, she had finally written back.

His hands trembled as he pulled the envelope from his pocket. Some letters carry the weight of a lifetime. Some words have the power to change everything. And some stories, no matter how long they've been waiting, are never truly finished.`;

export default function UploadPage() {
  const router = useRouter();
  const { addBook } = useBookStore();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ chunks: number; words: number } | null>(null);
  
  // Update preview when text changes
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setError('');
    
    if (newText.trim().length > 50) {
      const chunks = chunkText(newText);
      const wordCount = newText.trim().split(/\s+/).length;
      setPreview({ chunks: chunks.length, words: wordCount });
    } else {
      setPreview(null);
    }
  }, []);
  
  // Load sample text
  const handleLoadSample = useCallback(() => {
    setTitle('The Letter');
    handleTextChange(SAMPLE_TEXT);
  }, [handleTextChange]);
  
  // Create book and navigate to reading
  const handleCreate = useCallback(async () => {
    if (!text.trim()) {
      setError('Please paste some text first');
      return;
    }
    
    if (text.trim().split(/\s+/).length < 20) {
      setError('Please paste at least 20 words');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const book = await addBook(title || 'Untitled', text);
      router.push(`/read/${book.id}`);
    } catch (err) {
      setError('Failed to create book. Please try again.');
      setIsProcessing(false);
    }
  }, [title, text, addBook, router]);
  
  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]" />
      
      {/* Header */}
      <header className="relative z-10 p-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="control-btn w-10 h-10"
          aria-label="Go back"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="w-5 h-5"
          >
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">New Book</h1>
      </header>
      
      {/* Content */}
      <div className="relative z-10 flex-1 p-4 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Title input */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
            >
              Title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome book..."
              className="input-field"
            />
          </div>
          
          {/* Text input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="text" 
                className="block text-sm font-medium text-[var(--text-secondary)]"
              >
                Paste your text
              </label>
              <button
                onClick={handleLoadSample}
                className="text-xs text-[var(--accent-primary)] hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              id="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your book, article, or any text here..."
              className="textarea-field min-h-[300px]"
            />
          </div>
          
          {/* Preview stats */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass rounded-xl p-4"
            >
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Preview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-primary)]">
                    {preview.chunks}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Reels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-secondary)]">
                    {preview.words}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Words</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                ~{Math.ceil(preview.words / 200)} min reading time
              </p>
            </motion.div>
          )}
          
          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          
          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isProcessing || !text.trim()}
            className={`btn-primary w-full py-4 text-lg ${
              isProcessing || !text.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Processing...
              </span>
            ) : (
              'Start Reading'
            )}
          </button>
          
          {/* Tips */}
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            <p>💡 Tip: For best experience, paste text with clear paragraphs</p>
            <p>📱 Supports any text: books, articles, stories, etc.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

