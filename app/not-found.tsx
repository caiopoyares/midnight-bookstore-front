import Link from 'next/link';
export default function Missing() {
  return (
    <div className="shell page">
      <h1>Página não encontrada</h1>
      <Link className="outline" href="/#shelves">
        Explorar as estantes
      </Link>
    </div>
  );
}
