'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, money, Receipt } from '../lib/api';
import { useBag } from './bag';
export function OrderStatus({ receipt }: { receipt: Receipt }) {
  const [order, set] = useState(receipt),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const { ready, paid } = useBag();
  useEffect(() => {
    if (order.state !== 'expired') return;
    const attempt = JSON.parse(
      sessionStorage.getItem('nightjar.attempt') ?? 'null',
    );
    if (attempt?.orderId === order.id)
      sessionStorage.removeItem('nightjar.attempt');
    sessionStorage.removeItem('nightjar.order.' + order.id);
  }, [order.id, order.state]);
  useEffect(() => {
    if (ready && (order.state === 'paid' || order.state === 'shipped'))
      paid(order.id);
  }, [ready, order.id, order.state, paid]);
  useEffect(() => {
    if (order.state !== 'pending') return;
    const timer = setInterval(async () => {
      try {
        const { data } = await api.GET('/v1/orders/{id}', {
          params: { path: { id: order.id } },
        });
        if (data) set(data);
      } catch {}
    }, 4000);
    return () => clearInterval(timer);
  }, [order.id, order.state]);
  async function pay() {
    setBusy(true);
    setError('');
    try {
      const params = { path: { id: order.id } };
      if (order.mode === 'demo') {
        const { data, error } = await api.POST('/v1/orders/{id}/demo-pay', {
          params,
        });
        if (!data) throw Error(error?.message);
        set(data);
      } else {
        const { data, error } = await api.POST('/v1/orders/{id}/resume', {
          params,
        });
        if (!data) throw Error(error?.message);
        location.assign(data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pagamento indisponível.');
    } finally {
      setBusy(false);
    }
  }
  const headings = {
    pending:
      order.mode === 'demo' ? 'Pagamento de teste' : 'Aguardando pagamento',
    paid: 'Pedido confirmado',
    expired: 'Reserva expirada',
    shipped: 'Seus livros foram enviados',
  };
  return (
    <div className="shell page receipt">
      <span className="smallcap accent">Pedido {order.id.slice(0, 8)}</span>
      <h1 aria-live="polite">{headings[order.state]}</h1>
      <p>
        {order.state === 'pending'
          ? order.mode === 'demo'
            ? 'Esta é uma compra de demonstração. O pagamento é simulado.'
            : 'Seus exemplares estão reservados enquanto o pagamento é confirmado.'
          : order.state === 'expired'
            ? 'Seus exemplares foram liberados. Consulte a disponibilidade nas estantes.'
            : order.state === 'paid'
              ? 'Seus livros estão separados para envio. Acompanhe o pedido pela sua conta.'
              : 'A livraria marcou seu pedido como enviado.'}
      </p>
      <div className="panel">
        <h2>Resumo do pedido</h2>
        {order.lines.map((l) => (
          <p className="summary-row" key={l.sku}>
            <span>
              {l.quantity} × {l.title}
              <small>{l.format}</small>
            </span>
            <span>{money(l.price * l.quantity, order.currency)}</span>
          </p>
        ))}
        <div className="totals">
          <p>
            <span>Frete</span>
            {money(order.shipping, order.currency)}
          </p>
          <p>
            <b>Total</b>
            <b>{money(order.total, order.currency)}</b>
          </p>
        </div>
        {order.state === 'pending' && (
          <button className="primary" onClick={pay} disabled={busy}>
            {busy
              ? 'Processando…'
              : order.mode === 'demo'
                ? 'Concluir pagamento de teste'
                : 'Abrir pagamento'}
          </button>
        )}
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
      </div>
      <Link href="/#shelves" className="text-link">
        Voltar às estantes
      </Link>
    </div>
  );
}
