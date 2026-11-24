import createClient from 'openapi-fetch';
import type { components, paths } from './generated';
export type Book = components['schemas']['Book'];
export type Shop = components['schemas']['Shop'];
export type Basket = components['schemas']['Checkout'];
export type Receipt = components['schemas']['Receipt'];
export type Dashboard = components['schemas']['Dashboard'];
export const api = createClient<paths>({ baseUrl: '/api', cache: 'no-store' });
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  );
