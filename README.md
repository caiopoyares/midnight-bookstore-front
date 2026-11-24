# Nightjar Books

A Next.js and TypeScript storefront for an independent horror bookseller. Browse six sample titles, filter by genre or edition, search by author, and check out as a guest. A staff desk handles stock receipts, corrections and shipping. The API lives in the separate `horror-bookstore-backend` repository.

## Run locally

Use Node.js 24 LTS. First start the backend with `npm ci` and `npm run dev` in its own directory. Then run the following from this repository.

```sh
npm ci
npm run dev
```

Open [the local bookstore](http://localhost:3000). Add an edition to your bag and choose **Complete demo payment** on the order page. The receipt survives a refresh. Open **Staff desk** from the footer and use the generated key from the backend's `.local/staff-key` file to adjust stock or ship the order.

The server reads `API_URL` (default `http://127.0.0.1:4100`). The browser talks to the storefront's same-origin `/api` routes. Keep provider credentials in the backend. Set the backend's `STOREFRONT_URL` to this site's canonical origin when using hosted payment.

## Build and verify

```sh
npm run build
npm start
```

For browser tests, build both repositories first and keep them side by side, or set `BOOKSTORE_API_DIR` to the backend path. Install Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome. Then run `npm run test:e2e`. The suite launches disposable local services on ports 3312, 4312 and 55433, uses sample shipping details and exercises search and keyboard-only checkout on a mobile viewport. A generated throwaway staff credential exercises receiving stock and reviewing the audit trail.

## API changes and deployment

The source contract is versioned in the backend. This repository vendors release 1.0.0 at `contract/openapi-1.0.0.json`. On an API upgrade, copy the new release, update the generate script's filename, run `npm run api:generate`, then build and run the browser tests. The generated types power the storefront's OpenAPI client.

Deploy this repository as its own Node service using the included Dockerfile or `npm start`. Set `API_URL` at runtime to the private backend origin reachable from that service. Serve the application over HTTPS and configure per-client rate limiting for `/api/v1/checkout` at the edge. Cache the WebP artwork as static assets. The store reads inventory and order state on demand.

The charcoal and oxblood design uses locally bundled Spectral and Inter fonts. Original artwork for the moonlit manor and six editions lives in `public/art/`. The illustrations were generated for this project. [Artwork briefs](artwork-prompts.txt)
