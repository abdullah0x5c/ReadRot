'use client';

// ==========================================
// Library Page
// ==========================================
// Shows all saved books

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookStore } from '@/stores/useBookStore';
import { Book } from '@/types';

/**
 * Single book card component
 */
function BookCard({ book, onRead, onDelete }: { 
  book: Book; 
  onRead: () => void;
  onDelete: () => void;
}) {
  const progress = Math.round(((book.lastChunkIndex + 1) / book.chunks.length) * 100);
  const wordCount = book.text.split(/\s+/).length;
  const lastRead = book.lastReadAt 
    ? new Date(book.lastReadAt).toLocaleDateString()
    : 'Never';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 cursor-pointer"
      onClick={onRead}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{book.title}</h3>
          {book.author && (
            <p className="text-sm text-[var(--text-secondary)] truncate">
              by {book.author}
            </p>
          )}
        </div>
        
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"
          aria-label="Delete book"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="w-5 h-5"
          >
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span>{book.chunks.length} reels</span>
        <span>•</span>
        <span>{wordCount} words</span>
        <span>•</span>
        <span>Last: {lastRead}</span>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {progress}% complete
        </p>
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const { books, loadBooks, deleteBook, isLoading } = useBookStore();
  
  // Load books on mount
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);
  
  const handleRead = (bookId: string) => {
    router.push(`/read/${bookId}`);
  };
  
  const handleDelete = async (bookId: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      await deleteBook(bookId);
    }
  };
  
  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]" />
      
      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="control-btn w-10 h-10"
            aria-label="Go home"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">My Library</h1>
        </div>
        
        <button
          onClick={() => router.push('/upload')}
          className="btn-primary px-4 py-2 text-sm"
        >
          + New
        </button>
      </header>
      
      {/* Content */}
      <div className="relative z-10 flex-1 p-4 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Add your first book to start reading
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="btn-primary"
            >
              Add Book
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  book={book}
                  onRead={() => handleRead(book.id)}
                  onDelete={() => handleDelete(book.id, book.title)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

