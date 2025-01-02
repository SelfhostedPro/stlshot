import { PersistStorage, StorageValue, StateStorage } from "zustand/middleware";

// src/components/demos/stls/indexedDBStorage.ts
interface StorageConfig {
    name: string;
    version: number;
  }
  
  // Original implementation for simple storage
  export const createIndexedDBStorage = <T>({ name, version }: StorageConfig) => {
    return createSimpleStorage<T>({ name, version });
  };
  
  // New implementation for Zustand persist middleware
  export const createPersistStorage = <T extends object>({ name, version }: StorageConfig): PersistStorage<T> => {
    // Open DB connection once and reuse it
    let dbPromise: Promise<IDBDatabase> | null = null;
  
    const getDB = (): Promise<IDBDatabase> => {
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('state')) {
              db.createObjectStore('state');
            }
          };
        });
      }
      return dbPromise;
    };
  
    return {
      getItem: async (key: string): Promise<StorageValue<T> | null> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readonly');
          const store = transaction.objectStore('state');
          const request = store.get(key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      },
  
      setItem: async (key: string, value: StorageValue<T>): Promise<void> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.put(value, key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      },
  
      removeItem: async (key: string): Promise<void> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.delete(key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      },
    };
  };
  
  // Base implementation that both versions use
  const createSimpleStorage = <T>({ name, version }: StorageConfig) => {
    let dbPromise: Promise<IDBDatabase> | null = null;
  
    const getDB = (): Promise<IDBDatabase> => {
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('state')) {
              db.createObjectStore('state');
            }
          };
        });
      }
      return dbPromise;
    };
  
    return {
      getItem: async (key: string): Promise<T | null> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readonly');
          const store = transaction.objectStore('state');
          const request = store.get(key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      },
  
      setItem: async (key: string, value: T): Promise<void> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.put(value, key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      },
  
      removeItem: async (key: string): Promise<void> => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.delete(key);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      },
    };
  };
  