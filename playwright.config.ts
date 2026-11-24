import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',workers:1,fullyParallel:false,timeout:45000,
 use:{baseURL:process.env.SHOP_URL ?? 'http://localhost:3000',channel:process.env.PLAYWRIGHT_CHANNEL,trace:'retain-on-failure'}
});
