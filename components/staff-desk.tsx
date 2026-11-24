'use client';
import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { api, Dashboard, money } from '../lib/api';
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
      throw Error(reply.error?.message ?? 'Staff desk unavailable.');
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
      tell(e instanceof Error ? e.message : 'Request failed.');
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
    }, 'Stock adjustment recorded.');
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
          <h2>Bookseller access</h2>
          <label>
            Staff access key
            <input
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            Open staff desk
          </button>
        </form>
      ) : (
        <>
          <div className="staff-bar">
            <span>Signed in as {data.actor}</span>
            <button
              className="outline"
              disabled={busy}
              onClick={() => execute(refresh)}
            >
              Refresh
            </button>
            <button
              className="outline"
              onClick={() => {
                setData(null);
                setKey('');
                tell('');
              }}
            >
              Sign out
            </button>
          </div>
          <section className="staff-section">
            <h2>Inventory</h2>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Edition</th>
                    <th>SKU</th>
                    <th>On hand</th>
                    <th>Reserved</th>
                    <th>Available</th>
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
            <h2>Adjust stock</h2>
            <label>
              Edition
              <select name="sku">
                {data.stock.map((s) => (
                  <option key={s.sku}>{s.sku}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity change
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
              Reason
              <input name="reason" maxLength={200} required />
            </label>
            <button className="primary" disabled={busy}>
              Save adjustment
            </button>
          </form>
          <section className="staff-section">
            <h2>Orders</h2>
            {!data.orders.length && <p>No orders yet.</p>}
            {data.orders.map((o) => (
              <article className="order-card" key={o.id}>
                <div>
                  <h3>
                    {o.address.name} · {money(o.total)}
                  </h3>
                  <small>{o.id}</small>
                  <p>
                    {o.state} · {o.email}
                  </p>
                  {o.state === 'pending' && (
                    <p>Hold due {new Date(o.expires_at).toLocaleString()}</p>
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
                      }, 'Order marked as shipped.')
                    }
                  >
                    Mark shipped
                  </button>
                )}
              </article>
            ))}
          </section>
          <section className="staff-section">
            <h2>Stock history</h2>
            {data.log.length ? (
              data.log.map((l, i) => (
                <p key={i}>
                  {l.sku} · {l.delta > 0 ? '+' : ''}
                  {l.delta} · {l.reason} · {l.actor} ·{' '}
                  {new Date(l.created_at).toLocaleString()}
                </p>
              ))
            ) : (
              <p>No adjustments yet.</p>
            )}
          </section>
          <section className="staff-section">
            <h2>Email jobs awaiting delivery</h2>
            {data.jobs.length ? (
              data.jobs.map((j) => (
                <p key={j.order_id}>
                  {j.order_id.slice(0, 8)} · {j.state} · {j.attempts} attempts{' '}
                  {j.last_error}
                </p>
              ))
            ) : (
              <p>No outstanding email jobs.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
