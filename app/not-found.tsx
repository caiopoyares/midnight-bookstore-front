import Link from 'next/link';
export default function Missing() {
  return (
    <div className="shell page">
      <h1>Page not found</h1>
      <Link className="outline" href="/#shelves">
        Browse the shelves
      </Link>
    </div>
  );
}
