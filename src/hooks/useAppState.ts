import { useState, useEffect, useCallback } from 'react';
import { DB } from '@/lib/db';

export function useAppState() {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [photoIds, setPhotoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    await DB.init();
    const s = await DB.getAllRackStatuses();
    const p = await DB.getAllPhotoIds();
    setStatuses(s);
    setPhotoIds(new Set(p));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { statuses, photoIds, loading, refresh, setStatuses, setPhotoIds };
}
