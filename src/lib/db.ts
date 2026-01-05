// ==========================================
// IndexedDB Operations
// ==========================================
// Handles persistent storage for books and settings using IndexedDB

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Book, AppSettings, DEFAULT_APP_SETTINGS } from '@/types';

/**
 * Database schema definition for TypeScript type safety
 */
interface ReadRotDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: {
      'by-lastReadAt': number;
      'by-createdAt': number;
    };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'readrot-db';
const DB_VERSION = 1;

/**
 * Opens and initializes the database
 * Creates object stores and indexes on first run
 */
async function getDB(): Promise<IDBPDatabase<ReadRotDB>> {
  return openDB<ReadRotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create books store with indexes for sorting
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('by-lastReadAt', 'lastReadAt');
        bookStore.createIndex('by-createdAt', 'createdAt');
      }
      
      // Create settings store (single record)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

// ==========================================
// Book Operations
// ==========================================

/**
 * Saves a book to the database
 * @param book - The book to save
 */
export async function saveBook(book: Book): Promise<void> {
  const db = await getDB();
  await db.put('books', book);
}

/**
 * Retrieves a book by its ID
 * @param id - The book's UUID
 * @returns The book or undefined if not found
 */
export async function getBook(id: string): Promise<Book | undefined> {
  const db = await getDB();
  return db.get('books', id);
}

/**
 * Gets all books, sorted by last read time (most recent first)
 * @returns Array of all saved books
 */
export async function getAllBooks(): Promise<Book[]> {
  const db = await getDB();
  const books = await db.getAll('books');
  // Sort by lastReadAt (most recent first), then by createdAt
  return books.sort((a, b) => {
    const aTime = a.lastReadAt || a.createdAt;
    const bTime = b.lastReadAt || b.createdAt;
    return bTime - aTime;
  });
}

/**
 * Deletes a book from the database
 * @param id - The book's UUID to delete
 */
export async function deleteBook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('books', id);
}

/**
 * Updates the reading progress for a book
 * @param id - The book's UUID
 * @param chunkIndex - The current chunk index
 */
export async function updateReadingProgress(id: string, chunkIndex: number): Promise<void> {
  const db = await getDB();
  const book = await db.get('books', id);
  if (book) {
    book.lastChunkIndex = chunkIndex;
    book.lastReadAt = Date.now();
    await db.put('books', book);
  }
}

// ==========================================
// Settings Operations
// ==========================================

const SETTINGS_KEY = 'app-settings';

/**
 * Gets the app settings, returning defaults if none saved
 * @returns The current app settings
 */
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', SETTINGS_KEY);
  return settings || DEFAULT_APP_SETTINGS;
}

/**
 * Saves app settings
 * @param settings - The settings to save
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, SETTINGS_KEY);
}

/**
 * Updates specific settings fields
 * @param updates - Partial settings to merge with existing
 */
export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await saveSettings({ ...current, ...updates });
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Clears all data from the database (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('books');
  await db.clear('settings');
}

/**
 * Gets the total count of saved books
 */
export async function getBookCount(): Promise<number> {
  const db = await getDB();
  return db.count('books');
}

