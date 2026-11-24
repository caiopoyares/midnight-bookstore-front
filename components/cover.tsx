import type { Book } from '../lib/api';
export function Cover({
  book,
}: {
  book: Pick<Book, 'slug' | 'title' | 'author'>;
}) {
  return (
    <div
      className={'jacket jacket-' + book.slug}
      aria-hidden="true"
      style={{ backgroundImage: 'url(/art/' + book.slug + '.webp)' }}
    >
      <div className="jacket-type">
        <span>{book.author}</span>
        <strong>{book.title}</strong>
      </div>
    </div>
  );
}
