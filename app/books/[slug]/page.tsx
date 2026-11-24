import Link from 'next/link';
import { notFound } from 'next/navigation';
import { backend } from '../../../lib/server';
import { Cover } from '../../../components/cover';
import { EditionPicker } from '../../../components/edition-picker';
type Props = { params: Promise<{ slug: string }> };
async function getBook(slug: string) {
  const { data, response } = await backend().GET('/v1/books/{slug}', {
    params: { path: { slug } },
  });
  if (response.status === 404) notFound();
  if (!data) throw Error('Catalog unavailable.');
  return data;
}
export async function generateMetadata({ params }: Props) {
  return { title: (await getBook((await params).slug)).title };
}
export default async function BookPage({ params }: Props) {
  const book = await getBook((await params).slug);
  return (
    <div className="shell page">
      <Link className="back" href="/#shelves">
        Bookshelves
      </Link>
      <article className="detail">
        <div className="large-cover">
          <Cover book={book} />
        </div>
        <div>
          <span className="smallcap accent">{book.genre}</span>
          <h1>{book.title}</h1>
          <p className="byline">by {book.author}</p>
          <p>{book.synopsis}</p>
          <EditionPicker book={book} />
          <aside className="staff-note">
            <h2>Bookseller’s note</h2>
            <p>{book.note}</p>
          </aside>
        </div>
      </article>
    </div>
  );
}
