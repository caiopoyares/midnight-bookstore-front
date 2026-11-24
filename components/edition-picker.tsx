'use client';
import { useState } from 'react';
import { Book, money } from '../lib/api';
import { useBag } from './bag';
import { Icon } from './icons';
export function EdiçãoPicker({ book }: { book: Book }) {
  const { add, lines, ready } = useBag(),
    [sku, select] = useState(
      book.editions.find((x) => x.available)?.sku ?? book.editions[0].sku,
    );
  const edition = book.editions.find((e) => e.sku === sku)!,
    inBag = lines.find((x) => x.sku === sku)?.quantity ?? 0;
  const buttonText = !ready
    ? 'Carregando sacola…'
    : edition.available === 0
      ? 'Esgotado'
      : inBag >= Math.min(edition.available, 99)
        ? 'Quantidade máxima na sacola'
        : 'Adicionar à sacola';
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
        }}
      >
        <Icon name="bag" size={18} />
        {buttonText}
      </button>
    </div>
  );
}
