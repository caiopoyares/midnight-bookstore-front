import createClient from 'openapi-fetch';
import type { components, paths } from './generated';
export type Book = components['schemas']['Book'];
export type Shop = components['schemas']['Shop'];
export type Basket = components['schemas']['Checkout'];
export type Receipt = components['schemas']['Receipt'];
export type Dashboard = components['schemas']['Dashboard'];
export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100',
  cache: 'no-store',
  credentials: 'include',
});
export const money = (cents: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(
    cents / 100,
  );
