'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
type Customer = { id: string; email: string };
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100';
export async function authRequest(path: string, body?: unknown) {
  const response = await fetch(base + '/v1/auth/' + path, {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok)
    throw Error(data.message ?? 'Não foi possível acessar sua conta.');
  return data;
}
const Context = createContext<{
  user: Customer | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}>(null!);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null),
    [ready, setReady] = useState(false);
  async function refresh() {
    try {
      setUser(await authRequest('me'));
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void refresh();
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    return () => window.removeEventListener('focus', focus);
  }, []);
  async function logout() {
    await authRequest('logout', {});
    setUser(null);
  }
  return (
    <Context.Provider value={{ user, ready, refresh, logout }}>
      {children}
    </Context.Provider>
  );
}
export const useAccount = () => useContext(Context);
