import { useCallback, useEffect, useState } from 'react';
import { subscribeDataChange } from '../lib/storage.js';

export function useLiveData(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try { const result = await fetcher(); setData(result); setError(''); return result; }
    catch (err) { setError(err.message || 'Something went wrong.'); return null; }
    finally { setLoading(false); }
  }, [fetcher]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const value = await fetcher(); if (active) { setData(value); setError(''); } }
      catch (err) { if (active) setError(err.message || 'Unable to load data.'); }
      finally { if (active) setLoading(false); }
    };
    load();
    const unsubscribe = subscribeDataChange(() => { if (active) load(); });
    return () => { active = false; unsubscribe(); };
  }, [fetcher]);
  return { data, loading, error, refresh };
}
