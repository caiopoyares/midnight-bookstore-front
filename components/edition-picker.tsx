'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Book, money } from '../lib/api';
import { useBag } from './bag';
import { Icon } from './icons';
export function EditionPicker({ book }: { book: Book }) {
  const { add, lines, ready } = useBag(),
    [sku, select] = useState(
      book.editions.find((x) => x.available)?.sku ?? book.editions[0].sku,
    ),
    [added, setAdded] = useState(false);
  const edition = book.editions.find((e) => e.sku === sku)!,
    inBag = lines.find((x) => x.sku === sku)?.quantity ?? 0;
  return (
    <div className="purchase">
      <fieldset>
        <legend>Choose an edition</legend>
        <div className="editions">
          {book.editions.map((e) => (
            <label key={e.sku} className={sku === e.sku ? 'chosen' : ''}>
              <input
                type="radio"
                name="format"
                checked={sku === e.sku}
                onChange={() => {
                  select(e.sku);
                  setAdded(false);
                }}
              />
              {e.format}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="purchase-price">
        <strong>{money(edition.price)}</strong>
        <span>
          {edition.available === 0
            ? 'Sold out'
            : edition.available === 1
              ? 'Last copy'
              : 'In stock'}
        </span>
      </div>
      <button
        className="primary"
        disabled={!ready || inBag >= edition.available || inBag >= 99}
        onClick={() => {
          add(book, sku, 1);
          setAdded(true);
        }}
      >
        <Icon name="bag" size={18} />
        {edition.available === 0 ? 'Sold out' : 'Add to bag'}
      </button>
      <div className="inline-status" aria-live="polite">
        {added ? 'Added to your bag. ' : ''}
        {inBag > 0 && (
          <Link className="text-link" href="/bag">
            View bag ({inBag})
          </Link>
        )}
      </div>
    </div>
  );
}
