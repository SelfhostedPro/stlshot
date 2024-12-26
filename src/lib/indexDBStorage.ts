// src/components/demos/stls/indexedDBStorage.ts
interface StorageConfig {
    name: string;
    version: number;
  }
  
  export const createIndexedDBStorage = <T>({ name, version }: StorageConfig) => {
    const storage = {
      getItem: async (key: string): Promise<T | null> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('state', 'readonly');
            const store = transaction.objectStore('state');
            const getValue = store.get(key);
  
            getValue.onerror = () => reject(getValue.error);
            getValue.onsuccess = () => resolve(getValue.result as T);
          };
  
          request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('state');
          };
        });
      },
  
      setItem: async (key: string, value: T): Promise<void> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('state', 'readwrite');
            const store = transaction.objectStore('state');
            store.put(value, key);
            resolve();
          };
  
          request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('state');
          };
        });
      },
  
      removeItem: async (key: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(name, version);
  
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('state', 'readwrite');
            const store = transaction.objectStore('state');
            store.delete(key);
            resolve();
          };
        });
      },
    };
  
    return storage;
  };
  