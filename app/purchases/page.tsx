'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from '../../components/account';
import { useRemote, RemoteState, api } from '../../components/remote';
import { money } from '../../lib/api';

const states = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  shipped: 'Enviado',
  expired: 'Reserva expirada',
};

function PurchaseHistory({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const { data, error, retry } = useRemote(
    async () => {
      const result = await api.GET('/v1/orders', {
        params: { query: { page } },
      });
      if (!result.data)
        throw Error(
          result.error?.message ?? 'Não foi possível carregar suas compras.',
        );
      return result.data;
    },
    customerId + '/' + page,
  );
  if (!data) return <RemoteState error={error} retry={retry} />;
  if (!data.total)
    return (
      <div className="empty">
        <h2>Você ainda não fez pedidos</h2>
        <p>Encontre sua próxima leitura nas estantes.</p>
        <Link href="/#shelves" className="primary">
          Explorar os livros
        </Link>
      </div>
    );
  return (
    <>
      <p className="purchase-count">
        {data.total} {data.total === 1 ? 'pedido' : 'pedidos'}
      </p>
      <div className="purchase-list">
        {data.orders.map((order) => (
          <article className="panel purchase-history-card" key={order.id}>
            <div className="purchase-heading">
              <div>
                <h2>Pedido {order.id.slice(0, 8)}</h2>
                <time dateTime={order.created_at}>
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </time>
              </div>
              <span className="order-state">{states[order.state]}</span>
            </div>
            <ul>
              {order.lines.map((line) => (
                <li key={line.sku}>
                  {line.quantity} × {line.title}
                  <small>
                    {line.format} ·{' '}
                    {money(line.price * line.quantity, order.currency)}
                  </small>
                </li>
              ))}
            </ul>
            <div className="purchase-total">
              <strong>Total {money(order.total, order.currency)}</strong>
              <Link className="outline" href={'/orders/' + order.id}>
                {order.state === 'pending'
                  ? 'Continuar pagamento'
                  : 'Ver pedido'}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <nav aria-label="Páginas de compras" className="purchase-pagination">
        <button
          className="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </button>
        <span>
          Página {page} de {Math.ceil(data.total / data.pageSize)}
        </span>
        <button
          className="outline"
          disabled={page * data.pageSize >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </button>
      </nav>
    </>
  );
}

export default function PurchasesPage() {
  const { user, ready } = useAccount();
  return (
    <div className="shell page purchases-page">
      <h1>Minhas compras</h1>
      {!ready ? (
        <p>Carregando…</p>
      ) : user ? (
        <PurchaseHistory key={user.id} customerId={user.id} />
      ) : (
        <div className="panel form login">
          <p>Entre na sua conta para consultar seus pedidos.</p>
          <Link className="primary" href="/login?next=/purchases">
            Entrar na minha conta
          </Link>
        </div>
      )}
    </div>
  );
}
