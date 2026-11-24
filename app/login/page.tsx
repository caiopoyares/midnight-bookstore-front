'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authRequest, useAccount } from '../../components/account';
export default function Login() {
  const router = useRouter(),
    { refresh, user } = useAccount();
  const [email, setEmail] = useState(''),
    [token, setToken] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    function readToken() {
      const value = new URLSearchParams(location.hash.slice(1)).get('token');
      if (value) {
        setToken(value);
        setMessage('');
        setError('');
        history.replaceState(null, '', '/login');
      }
    }
    readToken();
    window.addEventListener('hashchange', readToken);
    return () => window.removeEventListener('hashchange', readToken);
  }, []);
  async function send() {
    setBusy(true);
    setError('');
    try {
      setMessage((await authRequest('link', { email })).message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    setError('');
    try {
      await authRequest('verify', { token });
      setToken('');
      await refresh();
      router.replace('/bag');
    } catch (e) {
      setError((e as Error).message);
      setToken('');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="shell page">
      <div className="panel form login">
        <h1>Entre na Midnight Books</h1>
        <p>
          Receba um link de acesso por e-mail para continuar sua compra. Sua
          sacola será preservada.
        </p>
        {token ? (
          <button className="primary" disabled={busy} onClick={verify}>
            {busy ? 'Entrando…' : 'Confirmar acesso'}
          </button>
        ) : user ? (
          <>
            <p>Você entrou como {user.email}.</p>
            <button className="primary" onClick={() => router.push('/bag')}>
              Voltar à sacola
            </button>
          </>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button className="primary" disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar link de acesso'}
            </button>
          </form>
        )}
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
