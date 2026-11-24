'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Book } from '../lib/api';
export type BagLine = {
  sku: string;
  slug: string;
  title: string;
  format: string;
  price: number;
  quantity: number;
};
type Cart = {
  lines: BagLine[];
  ready: boolean;
  add: (book: Book, sku: string, qty: number) => void;
  setQuantity: (sku: string, n: number) => void;
  paid: (id: string) => void;
};
const Context = createContext<Cart | null>(null);
const key = 'nightjar.bag.v1';
export function BagProvider({ children }: { children: ReactNode }) {
  const [lines, set] = useState<BagLine[]>([]),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (Array.isArray(value))
        set(
          value.filter(
            (x) =>
              typeof x?.sku === 'string' &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(lines));
  }, [ready, lines]);
  function add(book: Book, sku: string, qty: number) {
    const edition = book.editions.find((e) => e.sku === sku);
    if (!edition || qty < 1) return;
    set((current) => {
      const old = current.find((x) => x.sku === sku);
      if (old)
        return current.map((x) =>
          x === old
            ? {
                ...x,
                quantity: Math.min(99, edition.available, x.quantity + qty),
              }
            : x,
        );
      return [
        ...current,
        {
          sku,
          slug: book.slug,
          title: book.title,
          format: edition.format,
          price: edition.price,
          quantity: Math.min(qty, edition.available),
        },
      ];
    });
  }
  function setQuantity(sku: string, n: number) {
    set((items) =>
      n <= 0
        ? items.filter((x) => x.sku !== sku)
        : items.map((x) =>
            x.sku === sku ? { ...x, quantity: Math.min(n, 99) } : x,
          ),
    );
  }
  function paid(id: string) {
    const saved = sessionStorage.getItem('nightjar.order.' + id);
    if (!saved) return;
    sessionStorage.removeItem('nightjar.order.' + id);
    const snapshot: BagLine[] = JSON.parse(saved);
    set((items) =>
      items
        .map((item) => {
          const ordered = snapshot.find((x) => x.sku === item.sku);
          return ordered
            ? {
                ...item,
                quantity: Math.max(0, item.quantity - ordered.quantity),
              }
            : item;
        })
        .filter((x) => x.quantity > 0),
    );
    sessionStorage.removeItem('nightjar.attempt');
  }
  return (
    <Context.Provider value={{ lines, ready, add, setQuantity, paid }}>
      {children}
    </Context.Provider>
  );
}
export function useBag() {
  return useContext(Context)!;
}
