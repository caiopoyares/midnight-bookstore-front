'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export function useRemote<T>(load: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState('');
  const [version, retry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    load()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((e) => {
        if (active)
          setError(e.message || 'Não foi possível carregar os dados.');
      });
    return () => {
      active = false;
    };
  }, [key, version]);
  return { data, error, retry: () => retry((v) => v + 1) };
}
export function RemoteState({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return (
    <div className="shell page" role="status">
      {error ? (
        <>
          <p className="notice">{error}</p>
          <button className="outline" onClick={retry}>
            Tentar novamente
          </button>
        </>
      ) : (
        <p>Carregando…</p>
      )}
    </div>
  );
}
export { api };
