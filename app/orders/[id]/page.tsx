'use client';
import { useParams } from 'next/navigation';
import { useRemote, RemoteState, api } from '../../../components/remote';
import { OrderStatus } from '../../../components/order-status';
export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, retry } = useRemote(async () => {
    const r = await api.GET('/v1/orders/{id}', { params: { path: { id } } });
    if (!r.data)
      throw Error(
        r.error?.message ?? 'Entre na sua conta para consultar o pedido.',
      );
    return r.data;
  }, id);
  return data ? (
    <OrderStatus receipt={data} />
  ) : (
    <RemoteState error={error} retry={retry} />
  );
}
