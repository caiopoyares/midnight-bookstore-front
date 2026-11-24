'use client';
import Link from 'next/link';
import { useRemote, RemoteState, api } from '../components/remote';
import { useEffect, useState } from 'react';
import { Shelves } from '../components/shelves';
import { Icon } from '../components/icons';
export const dynamic = 'force-dynamic';
export default function Home() {
  const [query, setQuery] = useState('');
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') ?? '');
  }, []);
  const {
    data: books,
    error,
    retry,
  } = useRemote(async () => {
    const reply = await api.GET('/v1/books');
    if (!reply.data)
      throw Error(reply.error?.message ?? 'Catálogo indisponível.');
    return reply.data;
  }, 'books');
  if (!books) return <RemoteState error={error} retry={retry} />;
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <span className="pick-label">
              <span />
              Escolha da livraria
            </span>
            <h1>
              A assombração
              <br />
              <em>da Casa da Colina</em>
            </h1>
            <p>
              O clássico de Shirley Jackson sobre o medo que cresce em silêncio.
              Quatro pessoas e uma casa que deseja sua companhia.
            </p>
            <Link href="/books/hill-house" className="primary">
              <Icon name="book" size={18} />
              Conheça o livro
            </Link>
          </div>
        </div>
      </section>
      <Shelves key={query} books={books} query={query} />
    </>
  );
}
