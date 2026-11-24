'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell page">
      <h1>A livraria está temporariamente indisponível</h1>
      <p>Não foi possível carregar o catálogo. Tente novamente em instantes.</p>
      <button className="primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
