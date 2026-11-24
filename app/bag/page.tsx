import { backend } from '../../lib/server';
import { Checkout } from '../../components/checkout';
export const metadata = { title: 'Your bag' };
export const dynamic = 'force-dynamic';
export default async function BagPage() {
  const source = backend();
  const [shop, books] = await Promise.all([
    source.GET('/v1/shop'),
    source.GET('/v1/books'),
  ]);
  if (!shop.data || !books.data) throw Error('Shop unavailable.');
  return (
    <div className="shell page">
      <h1>Your bag</h1>
      <Checkout shop={shop.data} books={books.data} />
    </div>
  );
}
