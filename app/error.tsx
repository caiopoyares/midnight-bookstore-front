'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell page">
      <h1>The shop is temporarily unavailable</h1>
      <p>We couldn’t reach the catalog. Please try again in a moment.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
