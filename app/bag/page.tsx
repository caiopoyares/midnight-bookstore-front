'use client';
import { useRemote, RemoteState, api } from '../../components/remote';
import { Checkout } from '../../components/checkout';
export default function BagPage() {
  const { data, error, retry } = useRemote(async () => {
    const [shop, books] = await Promise.all([
      api.GET('/v1/shop'),
      api.GET('/v1/books'),
    ]);
    if (!shop.data || !books.data)
      throw Error('A livraria está temporariamente indisponível.');
    return { shop: shop.data, books: books.data };
  }, 'bag');
  return (
    <div className="shell page">
      <h1>Sua sacola</h1>
      {data ? (
        <Checkout {...data} />
      ) : (
        <RemoteState error={error} retry={retry} />
      )}
    </div>
  );
}
