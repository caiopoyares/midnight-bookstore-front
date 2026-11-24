'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from './account';
import { useBag } from './bag';
import { Icon, Wordmark } from './icons';
export function Header() {
  const { user, logout } = useAccount();
  const { lines } = useBag(),
    [search, setSearch] = useState(false);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  return (
    <header className="header">
      <div className="bar shell">
        <Link href="/" aria-label="Página inicial da Midnight Books">
          <Wordmark />
        </Link>
        <nav aria-label="Navegação principal">
          <Link href="/">Home</Link>
        </nav>
        <div className="tools">
          {user && (
            <Link className="account-button purchases-link" href="/purchases">
              Minhas compras
            </Link>
          )}
          {user ? (
            <button
              className="icon-button account-button"
              onClick={() => void logout()}
            >
              Sair
            </button>
          ) : (
            <Link className="account-button" href="/login">
              Entrar
            </Link>
          )}
          <button
            className="icon-button"
            aria-label="Buscar livros"
            aria-expanded={search}
            onClick={() => setSearch(!search)}
          >
            <Icon name={search ? 'close' : 'search'} />
          </button>
          <Link
            className="bag-link"
            href="/bag"
            aria-label={
              'Sacola, ' +
              itemCount +
              ' ' +
              (itemCount === 1 ? 'item' : 'itens')
            }
          >
            <span className="bag-icon">
              <Icon name="bag" />
              <span className="count" aria-hidden="true">
                {itemCount}
              </span>
            </span>
            <span className="bag-label">Sacola</span>
          </Link>
        </div>
      </div>
      {search && (
        <form className="header-search shell" action="/#shelves" method="get">
          <label htmlFor="site-search">Buscar nas estantes</label>
          <input
            id="site-search"
            name="q"
            autoFocus
            placeholder="Título ou autor"
          />
          <button className="primary">Buscar</button>
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
        <span>Livraria independente de terror</span>
        <Link href="/staff">Painel da livraria</Link>
      </div>
    </footer>
  );
}
