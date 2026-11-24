'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useBag } from './bag';
import { Icon, Wordmark } from './icons';
export function Header() {
  const { lines } = useBag(),
    [search, setSearch] = useState(false);
  return (
    <header className="header">
      <div className="bar shell">
        <Link href="/" aria-label="Nightjar Books home">
          <Wordmark />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#shelves">Bookshelves</Link>
          <Link href="/books/hill-house">Bookseller’s pick</Link>
        </nav>
        <div className="tools">
          <button
            className="icon-button"
            aria-label="Search books"
            aria-expanded={search}
            onClick={() => setSearch(!search)}
          >
            <Icon name={search ? 'close' : 'search'} />
          </button>
          <Link className="bag-link" href="/bag">
            <Icon name="bag" />
            <span>Bag</span>
            <span className="count">
              {lines.reduce((a, x) => a + x.quantity, 0)}
            </span>
          </Link>
        </div>
      </div>
      {search && (
        <form className="header-search shell" action="/#shelves" method="get">
          <label htmlFor="site-search">Search the shelves</label>
          <input
            id="site-search"
            name="q"
            autoFocus
            placeholder="Title or author"
          />
          <button className="primary">Search</button>
        </form>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="shell foot">
        <Link href="/">
          <Wordmark />
        </Link>
        <span>Independent horror booksellers</span>
        <Link href="/staff">Staff desk</Link>
      </div>
    </footer>
  );
}
