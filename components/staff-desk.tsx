'use client';
import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { api, Dashboard, money } from '../lib/api';
const status = (state: string) =>
  ({
    pending: 'Aguardando pagamento',
    paid: 'Pago',
    expired: 'Expirado',
    shipped: 'Enviado',
    queued: 'Na fila',
    failed: 'Falhou',
    sent: 'Enviado',
    'demo-preview': 'Demonstração',
  })[state] ?? state;
export function StaffDesk() {
  const [key, setKey] = useState(''),
    [data, setData] = useState<Dashboard | null>(null),
    [message, tell] = useState(''),
    [busy, setBusy] = useState(false);
  const attempt = useRef({ signature: '', id: '' });
  const headers = { Authorization: 'Bearer ' + key };
  async function refresh() {
    const reply = await api.GET('/v1/staff', { headers });
    if (!reply.data)
      throw Error(reply.error?.message ?? 'Painel da livraria indisponível.');
    setData(reply.data);
  }
  async function execute(action: () => Promise<void>, success = '') {
    if (busy) return;
    setBusy(true);
    tell('');
    try {
      await action();
      tell(success);
    } catch (e) {
      tell(
        e instanceof Error
          ? e.message
          : 'Não foi possível concluir a solicitação.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function adjust(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      values = new FormData(form);
    const fields = {
      sku: String(values.get('sku')),
      delta: Number(values.get('delta')),
      reason: String(values.get('reason')).trim(),
    };
    const signature = JSON.stringify(fields);
    if (attempt.current.signature !== signature)
      attempt.current = { signature, id: crypto.randomUUID() };
    await execute(async () => {
      const reply = await api.POST('/v1/staff/stock', {
        headers,
        body: { ...fields, requestId: attempt.current.id },
      });
      if (!reply.data) throw Error(reply.error?.message);
      await refresh();
      form.reset();
      attempt.current = { signature: '', id: '' };
    }, 'Ajuste de estoque registrado.');
  }
  return (
    <>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {!data ? (
        <form
          className="panel form login"
          onSubmit={(e) => {
            e.preventDefault();
            void execute(refresh);
          }}
        >
          <h2>Acesso da equipe</h2>
          <label>
            Chave de acesso da equipe
            <input
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            Abrir painel
          </button>
        </form>
      ) : (
        <>
          <div className="staff-bar">
            <span>Acesso de {data.actor}</span>
            <button
              className="outline"
              disabled={busy}
              onClick={() => execute(refresh)}
            >
              Atualizar
            </button>
            <button
              className="outline"
              onClick={() => {
                setData(null);
                setKey('');
                tell('');
              }}
            >
              Sair
            </button>
          </div>
          <section className="staff-section">
            <h2>Estoque</h2>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Edição</th>
                    <th>SKU</th>
                    <th>Em estoque</th>
                    <th>Reservados</th>
                    <th>Disponíveis</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stock.map((s) => (
                    <tr key={s.sku}>
                      <td>
                        {s.title}
                        <small>{s.format}</small>
                      </td>
                      <td>{s.sku}</td>
                      <td>{s.on_hand}</td>
                      <td>{s.reserved}</td>
                      <td>{s.on_hand - s.reserved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <form className="panel adjustment" onSubmit={adjust}>
            <h2>Ajustar estoque</h2>
            <label>
              Edição
              <select name="sku">
                {data.stock.map((s) => (
                  <option key={s.sku}>{s.sku}</option>
                ))}
              </select>
            </label>
            <label>
              Alteração de quantidade
              <input
                type="number"
                name="delta"
                placeholder="+2 or −1"
                required
                min="-100000"
                max="100000"
              />
            </label>
            <label>
              Motivo
              <input name="reason" maxLength={200} required />
            </label>
            <button className="primary" disabled={busy}>
              Salvar ajuste
            </button>
          </form>
          <section className="staff-section">
            <h2>Pedidos</h2>
            {!data.orders.length && <p>Nenhum pedido ainda.</p>}
            {data.orders.map((o) => (
              <article className="order-card" key={o.id}>
                <div>
                  <h3>
                    {o.address.name} · {money(o.total, o.currency)}
                  </h3>
                  <small>{o.id}</small>
                  <p>
                    {status(o.state)} · {o.email}
                  </p>
                  {o.state === 'pending' && (
                    <p>
                      Reserva até{' '}
                      {new Date(o.expires_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                  <p>
                    {o.lines
                      .map(
                        (l) =>
                          l.quantity + ' × ' + l.title + ' (' + l.format + ')',
                      )
                      .join(', ')}
                  </p>
                  {o.state === 'paid' && (
                    <p>
                      {[
                        o.address.street,
                        o.address.city,
                        o.address.region,
                        o.address.postal,
                        o.address.country,
                      ].join(', ')}
                    </p>
                  )}
                </div>
                {o.state === 'paid' && (
                  <button
                    className="outline"
                    disabled={busy}
                    onClick={() =>
                      execute(async () => {
                        const r = await api.POST('/v1/staff/orders/{id}/ship', {
                          headers,
                          params: { path: { id: o.id } },
                        });
                        if (!r.data) throw Error(r.error?.message);
                        await refresh();
                      }, 'Pedido marcado como enviado.')
                    }
                  >
                    Marcar como enviado
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="staff-section">
            <h2>Histórico do estoque</h2>
            {data.log.length ? (
              data.log.map((l, i) => (
                <p key={i}>
                  {l.sku} · {l.delta > 0 ? '+' : ''}
                  {l.delta} · {l.reason} · {l.actor} ·{' '}
                  {new Date(l.created_at).toLocaleString('pt-BR')}
                </p>
              ))
            ) : (
              <p>Nenhum ajuste ainda.</p>
            )}
          </section>
          <section className="staff-section">
            <h2>E-mails aguardando envio</h2>
            {data.jobs.length ? (
              data.jobs.map((j) => (
                <p key={j.order_id}>
                  {j.order_id.slice(0, 8)} · {status(j.state)} · {j.attempts}{' '}
                  tentativas {j.last_error}
                </p>
              ))
            ) : (
              <p>Nenhum e-mail pendente.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
