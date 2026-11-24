import createClient from 'openapi-fetch';
import type { paths } from './generated';
export const backend = () =>
  createClient<paths>({
    baseUrl: process.env.API_URL ?? 'http://127.0.0.1:4100',
    cache: 'no-store',
  });
