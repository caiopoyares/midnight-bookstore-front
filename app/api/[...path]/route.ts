import { NextRequest } from 'next/server';
const allowed =
  /^v1\/(books(?:\/[\w-]+)?|shop|checkout|orders\/[\w-]+(?:\/(?:demo-pay|resume))?|staff(?:\/stock|\/orders\/[\w-]+\/ship)?)$/;
async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join('/');
  if (!allowed.test(path))
    return Response.json({ message: 'Unknown route.' }, { status: 404 });
  if (request.method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host'))
      return Response.json({ message: 'Invalid origin.' }, { status: 403 });
  }
  const headers = new Headers();
  for (const name of ['authorization', 'idempotency-key', 'content-type']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(
      (process.env.API_URL ?? 'http://127.0.0.1:4100') + '/' + path,
      {
        method: request.method,
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
        body: request.method === 'POST' ? await request.text() : undefined,
      },
    );
    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { message: 'The bookshop is temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }
}
export { forward as GET, forward as POST };
