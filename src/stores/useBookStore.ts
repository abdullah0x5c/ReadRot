'use client';

// ==========================================
// Book Store (Zustand)
// ==========================================
// Manages the state for books and library

import { create } from 'zustand';
import { Book, BookSettings, DEFAULT_BOOK_SETTINGS } from '@/types';
import { chunkText } from '@/lib/chunker';
import { v4 as uuidv4 } from 'uuid';
import * as db from '@/lib/db';

interface BookState {
  // State
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  
  // Actions
  loadBooks: () => Promise<void>;
  addBook: (title: string, text: string, author?: string) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  setCurrentBook: (book: Book | null) => void;
  loadBook: (id: string) => Promise<Book | null>;
  updateProgress: (bookId: string, chunkIndex: number) => Promise<void>;
  updateBookSettings: (bookId: string, settings: Partial<BookSettings>) => Promise<void>;
}

/**
 * Zustand store for book/library state management
 */
export const useBookStore = create<BookState>((set, get) => ({
  // Initial state
  books: [],
  currentBook: null,
  isLoading: false,
  
  /**
   * Loads all books from IndexedDB
   */
  loadBooks: async () => {
    set({ isLoading: true });
    try {
      const books = await db.getAllBooks();
      set({ books, isLoading: false });
    } catch (error) {
      console.error('Failed to load books:', error);
      set({ isLoading: false });
    }
  },
  
  /**
   * Adds a new book to the library
   * Automatically chunks the text for reel display
   */
  addBook: async (title: string, text: string, author?: string) => {
    // Chunk the text for display
    const chunks = chunkText(text);
    
    // Create the book object
    const book: Book = {
      id: uuidv4(),
      title: title.trim() || 'Untitled Book',
      author: author?.trim(),
      text,
      chunks,
      createdAt: Date.now(),
      lastChunkIndex: 0,
      settings: { ...DEFAULT_BOOK_SETTINGS },
    };
    
    // Save to IndexedDB
    await db.saveBook(book);
    
    // Update state
    set(state => ({
      books: [book, ...state.books],
    }));
    
    return book;
  },
  
  /**
   * Deletes a book from the library
   */
  deleteBook: async (id: string) => {
    await db.deleteBook(id);
    set(state => ({
      books: state.books.filter(b => b.id !== id),
      currentBook: state.currentBook?.id === id ? null : state.currentBook,
    }));
  },
  
  /**
   * Sets the currently active book
   */
  setCurrentBook: (book: Book | null) => {
    set({ currentBook: book });
  },
  
  /**
   * Loads a specific book by ID
   */
  loadBook: async (id: string) => {
    const book = await db.getBook(id);
    if (book) {
      set({ currentBook: book });
    }
    return book || null;
  },
  
  /**
   * Updates reading progress for a book
   */
  updateProgress: async (bookId: string, chunkIndex: number) => {
    await db.updateReadingProgress(bookId, chunkIndex);
    
    // Update local state
    set(state => ({
      books: state.books.map(b => 
        b.id === bookId 
          ? { ...b, lastChunkIndex: chunkIndex, lastReadAt: Date.now() }
          : b
      ),
      currentBook: state.currentBook?.id === bookId
        ? { ...state.currentBook, lastChunkIndex: chunkIndex, lastReadAt: Date.now() }
        : state.currentBook,
    }));
  },
  
  /**
   * Updates settings for a specific book
   */
  updateBookSettings: async (bookId: string, settings: Partial<BookSettings>) => {
    const book = await db.getBook(bookId);
    if (book) {
      const updatedBook = {
        ...book,
        settings: { ...book.settings, ...settings },
      };
      await db.saveBook(updatedBook);
      
      set(state => ({
        books: state.books.map(b => 
          b.id === bookId ? updatedBook : b
        ),
        currentBook: state.currentBook?.id === bookId
          ? updatedBook
          : state.currentBook,
      }));
    }
  },
}));

