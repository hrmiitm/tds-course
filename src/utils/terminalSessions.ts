export type TerminalConnectionType = 'localhost' | 'codespaces' | 'custom';

export type TerminalSession = {
  id: string;
  name: string;
  type: TerminalConnectionType;
  url: string;
  port?: string;
  createdAt: number;
  updatedAt: number;
};

const DB_NAME = 'tds-course';
const DB_VERSION = 1;
const STORE = 'terminal_sessions';

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const req = fn(store);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);

      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export async function listTerminalSessions(): Promise<TerminalSession[]> {
  if (!hasIndexedDb()) return [];

  const sessions = await withStore<TerminalSession[]>('readonly', (store) => store.getAll());
  const allowed = new Set<TerminalConnectionType>(['localhost', 'codespaces', 'custom']);

  return (sessions ?? [])
    .filter((s) => allowed.has(s.type))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function upsertTerminalSession(session: TerminalSession): Promise<void> {
  if (!hasIndexedDb()) return;
  await withStore('readwrite', (store) => store.put(session));
}

export async function deleteTerminalSession(id: string): Promise<void> {
  if (!hasIndexedDb()) return;
  await withStore('readwrite', (store) => store.delete(id));
}
