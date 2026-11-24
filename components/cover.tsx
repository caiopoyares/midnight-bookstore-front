import type { Book } from '../lib/api';
export function Cover({
  book,
}: {
  book: Pick<Book, 'slug' | 'title' | 'author'>;
}) {
  const artwork: Record<string, string> = {
    dracula: 'carmilla',
    'dorian-gray': 'turn-of-the-screw',
    cthulhu: 'king-in-yellow',
    raven: 'hill-house',
    'monkey-paw': 'willows',
    'horror-dunwich': 'frankenstein',
  };
  return (
    <div
      className={'jacket jacket-' + book.slug}
      aria-hidden="true"
      style={{
        backgroundImage:
          'url(/art/' + (artwork[book.slug] ?? book.slug) + '.webp)',
      }}
    >
      <div className="jacket-type">
        <span>{book.author}</span>
        <strong>{book.title}</strong>
      </div>
    </div>
  );
}
