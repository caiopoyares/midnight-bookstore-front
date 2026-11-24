import Link from 'next/link';
import { backend } from '../lib/server';
import { Shelves } from '../components/shelves';
import { Icon } from '../components/icons';
export const dynamic = 'force-dynamic';
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { data: books } = await backend().GET('/v1/books');
  if (!books) throw Error('Catalog unavailable.');
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q) ?? '';
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <span className="pick-label">
              <span />
              Bookseller’s pick
            </span>
            <h1>
              The Haunting
              <br />
              <em>of Hill House</em>
            </h1>
            <p>
              Shirley Jackson’s classic of quiet dread. Four strangers, one
              summer, and a house that wants them to stay.
            </p>
            <Link href="/books/hill-house" className="primary">
              <Icon name="book" size={18} />
              Explore the book
            </Link>
          </div>
        </div>
      </section>
      <Shelves key={query} books={books} query={query} />
    </>
  );
}
