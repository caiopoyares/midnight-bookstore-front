'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRemote, RemoteState, api } from '../../../components/remote';
import { Cover } from '../../../components/cover';
import { EdiçãoPicker } from '../../../components/edition-picker';
export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: book,
    error,
    retry,
  } = useRemote(async () => {
    const r = await api.GET('/v1/books/{slug}', { params: { path: { slug } } });
    if (!r.data) throw Error(r.error?.message ?? 'Livro não encontrado.');
    return r.data;
  }, slug);
  if (!book) return <RemoteState error={error} retry={retry} />;
  return (
    <div className="shell page">
      <Link className="back" href="/#shelves">
        Estantes
      </Link>
      <article className="detail">
        <div className="large-cover">
          <Cover book={book} />
        </div>
        <div>
          <span className="smallcap accent">{book.genre}</span>
          <h1>{book.title}</h1>
          <p className="byline">por {book.author}</p>
          <section
            aria-labelledby="book-synopsis"
            style={{ marginBlock: '24px' }}
          >
            <h2 id="book-synopsis" style={{ fontSize: '1.55rem' }}>
              Sinopse
            </h2>
            <p>{book.synopsis}</p>
          </section>
          <EdiçãoPicker book={book} />
          <aside className="staff-note">
            <h2>Indicação da livraria</h2>
            <p>{book.note}</p>
          </aside>
        </div>
      </article>
    </div>
  );
}
