'use client';

// ==========================================
// Reading Page
// ==========================================
// The main reel-scrolling reading experience

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/stores/useBookStore';
import { ReelContainer } from '@/components/reel/ReelContainer';
import { Book } from '@/types';

interface ReadPageProps {
  params: Promise<{
    bookId: string;
  }>;
}

export default function ReadPage({ params }: ReadPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { loadBook, currentBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Load the book on mount
  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const book = await loadBook(resolvedParams.bookId);
        if (!book) {
          setError('Book not found');
        }
      } catch (err) {
        setError('Failed to load book');
      }
      setIsLoading(false);
    };
    
    fetchBook();
  }, [resolvedParams.bookId, loadBook]);
  
  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading book...</p>
        </div>
      </main>
    );
  }
  
  // Error state
  if (error || !currentBook) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-xl font-semibold mb-2">{error || 'Book not found'}</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            The book you&apos;re looking for doesn&apos;t exist
          </p>
          <button
            onClick={() => router.push('/library')}
            className="btn-primary"
          >
            Go to Library
          </button>
        </div>
      </main>
    );
  }
  
  // Main reading experience
  return (
    <ReelContainer 
      book={currentBook} 
      initialChunkIndex={currentBook.lastChunkIndex}
    />
  );
}

