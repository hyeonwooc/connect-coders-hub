// IndexedDB wrapper for SkylifeAR
const DB_NAME = 'SkylifeAR';
const DB_VER = 1;
let _db: IDBDatabase | null = null;

export interface InspectionRecord {
  id: string;
  rackId: string;
  rackName: string;
  date: number;
  inspector: string;
  notes: string;
  photoData: string | null;
  hpaUnits: HpaUnit[];
}

export interface HpaUnit {
  unitName: string;
  lcd: { state: string; rfOutput: string; powerMode: string };
  measurement: Record<string, number>;
}

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (_db) return res(_db);
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('inspections')) {
        const s = db.createObjectStore('inspections', { keyPath: 'id' });
        s.createIndex('rackId', 'rackId');
        s.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('rackStatus')) {
        db.createObjectStore('rackStatus', { keyPath: 'rackId' });
      }
    };
    req.onsuccess = (e: any) => { _db = e.target.result; res(_db!); };
    req.onerror = (e: any) => rej(e.target.error);
  });
}

function p<T>(req: IDBRequest): Promise<T> {
  return new Promise((res, rej) => {
    req.onsuccess = (e: any) => res(e.target.result);
    req.onerror = (e: any) => rej(e.target.error);
  });
}

function tx(storeName: string, mode: IDBTransactionMode = 'readonly') {
  return _db!.transaction(storeName, mode).objectStore(storeName);
}

export const DB = {
  init: open,

  saveInspection: async (record: InspectionRecord) => {
    await open(); return p(tx('inspections', 'readwrite').put(record));
  },
  getInspections: async (rackId: string): Promise<InspectionRecord[]> => {
    await open();
    return new Promise((res, rej) => {
      const idx = tx('inspections').index('rackId');
      const req = idx.getAll(rackId);
      req.onsuccess = (e: any) => res(e.target.result.sort((a: any, b: any) => b.date - a.date));
      req.onerror = (e: any) => rej(e.target.error);
    });
  },
  getAllInspections: async (): Promise<InspectionRecord[]> => {
    await open();
    return new Promise((res, rej) => {
      const req = tx('inspections').getAll();
      req.onsuccess = (e: any) => res(e.target.result.sort((a: any, b: any) => b.date - a.date));
      req.onerror = (e: any) => rej(e.target.error);
    });
  },
  deleteInspection: async (id: string) => {
    await open(); return p(tx('inspections', 'readwrite').delete(id));
  },

  savePhoto: async (rackId: string, base64: string) => {
    await open(); return p(tx('photos', 'readwrite').put({ id: rackId, data: base64, ts: Date.now() }));
  },
  getPhoto: async (rackId: string): Promise<string | null> => {
    await open(); const r: any = await p(tx('photos').get(rackId)); return r ? r.data : null;
  },
  deletePhoto: async (rackId: string) => {
    await open(); return p(tx('photos', 'readwrite').delete(rackId));
  },
  getAllPhotoIds: async (): Promise<string[]> => {
    await open();
    return new Promise((res, rej) => {
      const r = tx('photos').getAllKeys();
      r.onsuccess = (e: any) => res(e.target.result as string[]);
      r.onerror = (e: any) => rej(e.target.error);
    });
  },

  setRackStatus: async (rackId: string, status: string) => {
    await open(); return p(tx('rackStatus', 'readwrite').put({ rackId, status, ts: Date.now() }));
  },
  getAllRackStatuses: async (): Promise<Record<string, string>> => {
    await open();
    return new Promise((res, rej) => {
      const r = tx('rackStatus').getAll();
      r.onsuccess = (e: any) => {
        const m: Record<string, string> = {};
        e.target.result.forEach((i: any) => m[i.rackId] = i.status);
        res(m);
      };
      r.onerror = (e: any) => rej(e.target.error);
    });
  }
};
