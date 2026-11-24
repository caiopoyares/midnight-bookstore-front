import { notFound } from 'next/navigation';
import { backend } from '../../../lib/server';
import { OrderStatus } from '../../../components/order-status';
export const metadata = {
  title: 'Order status',
  robots: { index: false, follow: false },
};
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { response, data } = await backend().GET('/v1/orders/{id}', {
    params: { path: { id } },
  });
  if ([400, 404].includes(response.status)) notFound();
  if (!data) throw Error('Order unavailable.');
  return <OrderStatus receipt={data} />;
}
