'use client';
import { useState } from 'react';
import { Book, money } from '../lib/api';
import { useBag } from './bag';
import { Icon } from './icons';
export function EdiçãoPicker({ book }: { book: Book }) {
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
        <legend>Escolha uma edição</legend>
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
            ? 'Esgotado'
            : edition.available === 1
              ? 'Último exemplar'
              : 'Disponível'}
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
        {edition.available === 0 ? 'Esgotado' : 'Adicionar à sacola'}
      </button>
      <div className="inline-status" aria-live="polite">
        {added ? 'Adicionado à sua sacola. ' : ''}
      </div>
    </div>
  );
}
