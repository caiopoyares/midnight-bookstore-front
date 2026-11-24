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
  return (
    <header className="header">
      <div className="bar shell">
        <Link href="/" aria-label="Página inicial da Midnight Books">
          <Wordmark />
        </Link>
        <nav aria-label="Navegação principal">
          <Link href="/#shelves">Estantes</Link>
          <Link href="/books/hill-house">Escolha da livraria</Link>
        </nav>
        <div className="tools">
          <Link className="account-button purchases-link" href="/purchases">
            Minhas compras
          </Link>
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
          <Link className="bag-link" href="/bag">
            <Icon name="bag" />
            <span>Sacola</span>
            <span className="count">
              {lines.reduce((a, x) => a + x.quantity, 0)}
            </span>
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
