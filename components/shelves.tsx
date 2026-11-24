'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Book, money } from '../lib/api';
import { Cover } from './cover';
import { Icon } from './icons';
export function Shelves({ books, query }: { books: Book[]; query: string }) {
  const [genre, setGenre] = useState('All books'),
    [search, setSearch] = useState(query),
    [format, setFormat] = useState('All formats'),
    [stock, setStock] = useState(false),
    [filters, setFilters] = useState(Boolean(query));
  const genres = ['All books', ...new Set(books.map((b) => b.genre))];
  const visible = books.filter(
    (b) =>
      (genre === 'All books' || b.genre === genre) &&
      (b.title + ' ' + b.author)
        .toLowerCase()
        .includes(search.toLowerCase().trim()) &&
      b.editions.some(
        (e) =>
          (format === 'All formats' || e.format === format) &&
          (!stock || e.available > 0),
      ),
  );
  return (
    <section id="shelves" className="shelves shell">
      <div className="shelf-title">
        <h2>On the shelves</h2>
        <button
          className="outline filter-toggle"
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <Icon name="filter" size={17} />
          Filters{format !== 'All formats' || stock || search ? ' •' : ''}
        </button>
      </div>
      <div className="tabs" aria-label="Subgenre">
        {genres.map((g) => (
          <button
            key={g}
            aria-pressed={genre === g}
            className={genre === g ? 'active' : ''}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>
      {filters && (
        <div className="filter-row">
          <label>
            Title or author
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
            />
          </label>
          <label>
            Edition
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>All formats</option>
              {[
                ...new Set(
                  books.flatMap((b) => b.editions.map((e) => e.format)),
                ),
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={stock}
              onChange={(e) => setStock(e.target.checked)}
            />{' '}
            In stock only
          </label>
        </div>
      )}
      <div className="book-grid">
        {visible.map((b) => (
          <Link className="book-card" href={'/books/' + b.slug} key={b.slug}>
            <Cover book={b} />
            <span className="card-genre">{b.genre}</span>
            <h3>{b.title}</h3>
            <span className="author">{b.author}</span>
            <strong className="price">
              {money(Math.min(...b.editions.map((e) => e.price)))}
            </strong>
          </Link>
        ))}
      </div>
      {!visible.length && (
        <div className="empty">
          <h3>No books on this shelf</h3>
          <p>Try another title, author or filter.</p>
          <button
            className="outline"
            onClick={() => {
              setGenre('All books');
              setSearch('');
              setFormat('All formats');
              setStock(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
