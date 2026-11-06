/**
 * Lightweight IndexedDB helper for high-capacity client-side persistence
 * Solves the 5MB browser localStorage quota limitation for large imported datasets (e.g. 3,000+ questions)
 */

const DB_NAME = "egh_storage_db";
const STORE_NAME = "questions_store";
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window) || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn("IndexedDB open failed:", request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB initialization error:", err);
      resolve(null);
    }
  });
}

export async function getIdbItem<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve((req.result as T) ?? null);
        };

        req.onerror = () => {
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB get error:", err);
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function setIdbItem<T>(key: string, val: T): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(val, key);

        req.onsuccess = () => {
          resolve(true);
        };

        req.onerror = () => {
          console.warn("IndexedDB put error:", req.error);
          resolve(false);
        };
      } catch (err) {
        console.warn("IndexedDB transaction error:", err);
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

export async function deleteIdbItem(key: string): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

export async function clearIdbStore(): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

