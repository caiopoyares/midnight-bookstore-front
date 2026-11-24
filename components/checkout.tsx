'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { api, Basket, Book, money, Shop } from '../lib/api';
import { useBag } from './bag';
import { useAccount } from './account';
import { Cover } from './cover';
export function Checkout({ shop, books }: { shop: Shop; books: Book[] }) {
  const { user, ready: accountReady } = useAccount();
  const { ready, lines, setQuantity } = useBag(),
    [busy, loading] = useState(false),
    [error, report] = useState('');
  const items = lines.map((line) => {
    const book = books.find((b) => b.slug === line.slug),
      edition = book?.editions.find((e) => e.sku === line.sku);
    return { line, book, edition };
  });
  const subtotal = items.reduce(
    (sum, { edition, line }) =>
      sum + (edition?.price ?? line.price) * line.quantity,
    0,
  );
  async function checkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    loading(true);
    report('');
    try {
      const form = new FormData(e.currentTarget),
        get = (k: string) => String(form.get(k) ?? '').trim();
      const body: Basket = {
        email: user?.email ?? '',
        address: {
          name: get('name'),
          street: get('street'),
          city: get('city'),
          region: get('region'),
          postal: get('postal'),
          country: shop.country,
        },
        lines: lines.map(({ sku, quantity }) => ({ sku, quantity })),
      };
      // The digest keeps guest details out of browser storage while making retries stable.
      const bytes = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(body)),
      );
      const fingerprint = Array.from(new Uint8Array(bytes))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');
      const prior = JSON.parse(
        sessionStorage.getItem('nightjar.attempt') ?? 'null',
      );
      const key =
        prior?.fingerprint === fingerprint ? prior.key : crypto.randomUUID();
      sessionStorage.setItem(
        'nightjar.attempt',
        JSON.stringify({ fingerprint, key }),
      );
      const { data, error } = await api.POST('/v1/checkout', {
        body,
        params: { header: { 'Idempotency-Key': key } },
      });
      if (!data)
        throw Error(error?.message ?? 'Não foi possível iniciar o pagamento.');
      sessionStorage.setItem(
        'nightjar.order.' + data.id,
        JSON.stringify(lines),
      );
      sessionStorage.setItem(
        'nightjar.attempt',
        JSON.stringify({ fingerprint, key, orderId: data.id }),
      );
      location.assign(data.url);
    } catch (err) {
      report(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar a compra. Sua sacola foi preservada.',
      );
      loading(false);
    }
  }
  if (!ready) return <p>Carregando sua sacola…</p>;
  if (!lines.length)
    return (
      <div className="empty">
        <h2>Sua sacola está vazia</h2>
        <p>Encontre sua próxima leitura para a madrugada.</p>
        <Link className="primary" href="/#shelves">
          Explorar os livros
        </Link>
      </div>
    );
  return (
    <div className="checkout-grid">
      <div>
        <h2>Livros na sua sacola</h2>
        {items.map(({ line, book, edition }) => (
          <div className="bag-item" key={line.sku}>
            {book && (
              <Link href={'/books/' + book.slug} aria-label={book.title}>
                <Cover book={book} />
              </Link>
            )}
            <div>
              <h3>{book?.title ?? line.title}</h3>
              <span>
                {edition?.format ?? line.format} ·{' '}
                {money(edition?.price ?? line.price)}
              </span>
              <div className="stepper">
                <button
                  aria-label={'Diminuir quantidade de ' + line.title}
                  onClick={() => setQuantity(line.sku, line.quantity - 1)}
                >
                  −
                </button>
                <span>{line.quantity}</span>
                <button
                  aria-label={'Aumentar quantidade de ' + line.title}
                  disabled={
                    line.quantity >= Math.min(99, edition?.available ?? 0)
                  }
                  onClick={() => setQuantity(line.sku, line.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="remove"
                  onClick={() => setQuantity(line.sku, 0)}
                >
                  Remover
                </button>
              </div>
              {line.quantity > (edition?.available ?? 0) && (
                <span className="notice">
                  {edition?.available ?? 0} exemplares disponíveis. Uma compra
                  em andamento pode estar reservando seus livros.
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="totals">
          <p>
            <span>Subtotal</span>
            {money(subtotal)}
          </p>
          <p>
            <span>Frete</span>
            {money(shop.shipping)}
          </p>
          <p>
            <b>Total</b>
            <b>{money(subtotal + shop.shipping)}</b>
          </p>
        </div>
      </div>
      {accountReady && user ? (
        <form className="panel form" onSubmit={checkout}>
          <h2>Finalizar compra</h2>
          <label>
            E-mail
            <input
              value={user.email}
              readOnly
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label>
            Nome de quem vai receber
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label>
            Endereço e complemento
            <input
              name="street"
              autoComplete="street-address"
              required
              maxLength={180}
            />
          </label>
          <div className="pair">
            <label>
              Cidade
              <input
                name="city"
                autoComplete="address-level2"
                required
                maxLength={100}
              />
            </label>
            <label>
              Estado
              <input
                name="region"
                autoComplete="address-level1"
                required
                maxLength={100}
              />
            </label>
          </div>
          <div className="pair">
            <label>
              CEP
              <input
                name="postal"
                autoComplete="postal-code"
                required
                maxLength={24}
              />
            </label>
            <label>
              País
              <input readOnly value={shop.country} />
            </label>
          </div>
          <p className="hint">
            Os preços incluem os tributos aplicáveis. Seus exemplares ficam
            reservados ao continuar para o pagamento.
          </p>
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary">
            {busy ? 'Abrindo pagamento…' : 'Ir para o pagamento'}
          </button>
        </form>
      ) : (
        <div className="panel form">
          <h2>Entre para comprar</h2>
          <p>Identifique-se por e-mail para finalizar seu pedido.</p>
          <Link href="/login" className="primary">
            Entrar na minha conta
          </Link>
        </div>
      )}
    </div>
  );
}
