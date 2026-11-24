'use client';
import { useState } from 'react';
import { Book } from '../lib/api';
import { BookCard } from './book-card';
import { Icon } from './icons';
export function Shelves({ books, query }: { books: Book[]; query: string }) {
  const [genre, setGenre] = useState('Todos os livros'),
    [search, setSearch] = useState(query),
    [format, setFormat] = useState('Todos os formatos'),
    [stock, setStock] = useState(false),
    [filters, setFiltros] = useState(Boolean(query));
  const genres = ['Todos os livros', ...new Set(books.map((b) => b.genre))];
  const visible = books.filter(
    (b) =>
      (genre === 'Todos os livros' || b.genre === genre) &&
      (b.title + ' ' + b.author)
        .toLowerCase()
        .includes(search.toLowerCase().trim()) &&
      b.editions.some(
        (e) =>
          (format === 'Todos os formatos' || e.format === format) &&
          (!stock || e.available > 0),
      ),
  );
  return (
    <section id="shelves" className="shelves shell">
      <div className="shelf-title">
        <h2>Nas estantes</h2>
        <button
          className="outline filter-toggle"
          aria-expanded={filters}
          onClick={() => setFiltros(!filters)}
        >
          <Icon name="filter" size={17} />
          Filtros{format !== 'Todos os formatos' || stock || search ? ' •' : ''}
        </button>
      </div>
      <div className="tabs" aria-label="Subgênero">
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
            Título ou autor
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
            />
          </label>
          <label>
            Edição
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>Todos os formatos</option>
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
            Somente disponíveis
          </label>
        </div>
      )}
      <div className="book-grid">
        {visible.map((book) => (
          <BookCard
            key={book.slug + '/' + format}
            book={book}
            format={format}
          />
        ))}
      </div>
      {!visible.length && (
        <div className="empty">
          <h3>Nenhum livro nesta estante</h3>
          <p>Experimente outro título, autor ou filtro.</p>
          <button
            className="outline"
            onClick={() => {
              setGenre('Todos os livros');
              setSearch('');
              setFormat('Todos os formatos');
              setStock(false);
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  );
}
