'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import { Book, money } from '../lib/api';
import { useBag } from './bag';
import { Cover } from './cover';
import { Icon } from './icons';

export function BookCard({ book, format }: { book: Book; format: string }) {
  const choices = book.editions.filter(
    (e) => format === 'Todos os formatos' || e.format === format,
  );
  const [sku, setSku] = useState(
    (choices.find((e) => e.available > 0) ?? choices[0]).sku,
  );
  const edition = choices.find((e) => e.sku === sku)!;
  const { lines, ready, add } = useBag();
  const count = lines.find((line) => line.sku === sku)?.quantity ?? 0;
  const id = useId();
  const disabled = !ready || count >= Math.min(99, edition.available);
  return (
    <article className="book-card">
      <Link className="book-card-detail" href={'/books/' + book.slug}>
        <Cover book={book} />
        <span className="card-genre">{book.genre}</span>
        <h3>{book.title}</h3>
        <span className="author">{book.author}</span>
      </Link>
      <div className="card-purchase">
        {choices.length > 1 ? (
          <div>
            <label htmlFor={id}>Edição</label>
            <select
              id={id}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            >
              {choices.map((e) => (
                <option key={e.sku} value={e.sku}>
                  {e.format}
                  {e.available === 0 ? ' · Esgotado' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="card-format">{edition.format}</span>
        )}
        <strong className="price">{money(edition.price)}</strong>
        <button
          className="primary"
          disabled={disabled}
          aria-label={'Adicionar ' + book.title + ' à sacola'}
          onClick={() => add(book, sku, 1)}
        >
          <Icon name="bag" size={16} />
          {edition.available === 0
            ? 'Esgotado'
            : count >= Math.min(99, edition.available)
              ? 'Limite na sacola'
              : 'Adicionar à sacola'}
        </button>
        <div className="card-feedback" aria-live="polite">
          {count > 0 && (
            <Link className="text-link" href="/bag">
              Ver sacola ({count})
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
