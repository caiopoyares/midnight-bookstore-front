import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
for (const [device, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
] as const) {
  test(`book availability is shown in the button and the cart stays visible on ${device}`, async ({ page }, info) => {
    const book = {
      slug: 'frankenstein',
      title: 'Frankenstein',
      author: 'Mary Shelley',
      genre: 'Terror gótico',
      synopsis: 'Victor Frankenstein dá vida a uma criatura e a abandona. '.repeat(40),
      note: 'Um clássico do terror gótico.',
      editions: [
        { sku: 'FRAN-PB', format: 'Paperback', price: 4490, available: 1 },
        { sku: 'FRAN-HC', format: 'Capa dura', price: 8490, available: 0 },
      ],
    };
    await page.setViewportSize(viewport);
    await page.route('**/v1/books/frankenstein', (route) => route.fulfill({ json: book }));
    await page.goto('/books/frankenstein');
    const add = page.getByRole('button', { name: 'Adicionar à sacola', exact: true });
    await add.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect.poll(async () => (await page.locator('.header').boundingBox())!.y).toBe(0);
    await add.click();
    await expect(page.getByRole('link', { name: 'Sacola, 1 item', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Quantidade máxima na sacola', exact: true })).toBeDisabled();
    await expect(page.getByText('Adicionado à sua sacola.', { exact: true })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath(`sticky-book-${device}.png`) });

    await page.getByRole('radio', { name: 'Capa dura', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Esgotado', exact: true })).toBeDisabled();
    await page.getByRole('radio', { name: 'Paperback', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Quantidade máxima na sacola', exact: true })).toBeDisabled();

    book.editions[0].available = 120;
    await page.evaluate(() => {
      const key = 'nightjar.bag.v1';
      const lines = JSON.parse(localStorage.getItem(key)!);
      lines[0].quantity = 99;
      localStorage.setItem(key, JSON.stringify(lines));
    });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Quantidade máxima na sacola', exact: true })).toBeDisabled();
    await expect(page.locator('.bag-link .count')).toHaveText('99');
  });
}

test('desktop catalogue uses the direct API and has twelve Portuguese titles', async ({
  page,
}, info) => {
  const apiCalls: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/v1/')) apiCalls.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.book-card')).toHaveCount(12);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('desktop.png') });
  expect(
    apiCalls.some((x) => x.startsWith('http://localhost:4100/v1/books')),
  ).toBe(true);
  expect(apiCalls.some((x) => x.includes(':3000/api/'))).toBe(false);
  expect(
    await page
      .locator('.book-card .jacket')
      .first()
      .evaluate((el) => el.getBoundingClientRect().width),
  ).toBeLessThan(195);
  const carmilla = page.locator('.book-card').filter({
    has: page.getByRole('heading', { name: 'Carmilla', exact: true }),
  });
  const navigation = page.getByRole('navigation', {
    name: 'Navegação principal',
  });
  await expect(
    navigation.getByRole('link', { name: 'Home', exact: true }),
  ).toHaveAttribute('href', '/');
  await expect(
    navigation.getByRole('link', { name: 'Estantes', exact: true }),
  ).toHaveCount(0);
  await expect(
    navigation.getByRole('link', { name: 'Escolha da livraria', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Minhas compras', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.book-card button')).toHaveCount(0);
  await carmilla.scrollIntoViewIfNeeded();
  const price = await carmilla.locator('.price').boundingBox();
  await page.mouse.click(
    price!.x + price!.width / 2,
    price!.y + price!.height / 2,
  );
  await expect(page).toHaveURL(/\/books\/carmilla$/);
  await page
    .getByRole('button', { name: 'Adicionar à sacola', exact: true })
    .click();
  await expect(page.locator('.bag-link .count')).toHaveText('1');
  const badge = await page.locator('.bag-link .count').boundingBox();
  const bag = await page.locator('.bag-link svg').boundingBox();
  expect(badge!.y + badge!.height).toBeLessThanOrEqual(bag!.y + 6);
  expect(Math.abs(badge!.width - badge!.height)).toBeLessThan(1);
  await expect(page.locator('.bag-link .count')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await expect(page.locator('.bag-link .count')).toHaveCSS(
    'background-color',
    'rgb(255, 107, 100)',
  );
  await expect(page.locator('.bag-link .count')).toHaveCSS(
    'border-radius',
    '50%',
  );

  await page.goto('/');
  const frankenstein = page.locator('.book-card').filter({
    has: page.getByRole('heading', { name: 'Frankenstein', exact: true }),
  });
  await frankenstein
    .getByRole('combobox', { name: 'Edição', exact: true })
    .selectOption('FRAN-HC');
  await expect(
    frankenstein.getByRole('combobox', { name: 'Edição', exact: true }),
  ).toHaveValue('FRAN-HC');
  await expect(page).toHaveURL('http://localhost:3000/');
  await page.goto('/books/frankenstein');
  await expect(
    page.getByRole('radio', { name: 'Paperback', exact: true }),
  ).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Buscar livros' }).click();
  await page
    .getByRole('textbox', { name: 'Buscar nas estantes' })
    .fill('Bram Stoker');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await expect(page.locator('.book-card')).toContainText('Drácula');
});
test('mobile purchase requires email login, keeps the bag and uses a single-use link', async ({
  page,
  request,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.book-card')).toHaveCount(12);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath('mobile.png') });
  await page.goto('/books/carmilla');
  await expect(
    page.getByRole('heading', { name: 'Sinopse', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('section[aria-labelledby="book-synopsis"]'),
  ).toContainText('Uma visitante fascinante');
  await page.getByRole('button', { name: 'Adicionar à sacola' }).click();
  await expect(page.getByRole('link', { name: /Ver sacola/ })).toHaveCount(0);
  await expect(
    page.locator('section[aria-labelledby="book-synopsis"] p'),
  ).toHaveCount(2);
  const synopsis = await page
    .locator('section[aria-labelledby="book-synopsis"]')
    .textContent();
  expect(synopsis!.split(/\s+/).length).toBeGreaterThan(120);
  await page.getByRole('link', { name: 'Sacola, 1 item', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Entrar na minha conta' }),
  ).toBeVisible();
  const anonymous = await request.post('http://localhost:4100/v1/checkout', {
    data: {},
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  });
  expect(anonymous.status()).toBe(401);
  await page.getByRole('link', { name: 'Entrar na minha conta' }).click();
  const email = 'browser-' + Date.now() + '@example.test';
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(email);
  await page.getByRole('button', { name: 'Enviar link de acesso' }).click();
  await expect(page.getByRole('status')).toContainText(
    'caixa de e-mail de desenvolvimento',
  );
  await expect(
    page.getByRole('link', { name: 'Abrir caixa de e-mail de teste' }),
  ).toHaveAttribute('href', 'http://localhost:8025');
  const messages = await (
    await request.get('http://localhost:8025/api/v1/messages')
  ).json();
  const mail = messages.messages.find((m: any) =>
    m.To.some((x: any) => x.Address === email),
  );
  expect(mail).toBeTruthy();
  const message = await (
    await request.get('http://localhost:8025/api/v1/message/' + mail.ID)
  ).json();
  const link = message.Text.match(/http:\/\/localhost:3000\/login[^\s]+/)[0];
  await page.goto(link);
  await page.getByRole('button', { name: 'Confirmar acesso' }).click();
  await expect(page).toHaveURL(/\/bag$/);
  await expect(
    page.getByRole('heading', { name: 'Livros na sua sacola' }),
  ).toBeVisible();
  for (const [name, value] of [
    ['Nome de quem vai receber', 'Leitora de Teste'],
    ['Endereço e complemento', 'Rua Exemplo, 12'],
    ['Cidade', 'São Paulo'],
    ['Estado', 'SP'],
    ['CEP', '01001-000'],
  ]) {
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Ir para o pagamento' }).click();
  await page
    .getByRole('button', { name: 'Concluir pagamento de teste' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Pedido confirmado' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Pedido confirmado' }),
  ).toBeVisible();
  const receipt = page.url();
  await page.getByRole('link', { name: 'Minhas compras', exact: true }).click();
  await expect(page).toHaveURL(/\/purchases$/);
  const savedOrder = page.locator('.purchase-history-card').filter({
    has: page.locator('a[href="' + new URL(receipt).pathname + '"]'),
  });
  await expect(savedOrder).toContainText('Carmilla');
  await expect(savedOrder).toContainText('Pago');
  await savedOrder.getByRole('link', { name: 'Ver pedido' }).click();
  await expect(page).toHaveURL(receipt);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Minhas compras', exact: true }),
  ).toHaveCount(0);
  await page.goto(receipt);
  await expect(
    page.getByText('Entre na sua conta para continuar.'),
  ).toBeVisible();
  await page.goto(link);
  await page.getByRole('button', { name: 'Confirmar acesso' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('já foi usado');
  await page.goto('/purchases');
  await page.getByRole('link', { name: 'Entrar na minha conta' }).click();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(email);
  await page.getByRole('button', { name: 'Enviar link de acesso' }).click();
  await expect(page.getByRole('status')).toContainText(
    'caixa de e-mail de desenvolvimento',
  );
  const inbox = await (
    await request.get('http://localhost:8025/api/v1/messages')
  ).json();
  const latest = inbox.messages.find((m: any) =>
    m.To.some((to: any) => to.Address === email),
  );
  const delivered = await (
    await request.get('http://localhost:8025/api/v1/message/' + latest.ID)
  ).json();
  await page.goto(
    delivered.Text.match(/http:\/\/localhost:3000\/login[^\s]+/)[0],
  );
  await page.getByRole('button', { name: 'Confirmar acesso' }).click();
  await expect(page).toHaveURL(/\/purchases$/);
  await expect(
    page.getByRole('heading', { name: 'Minhas compras', exact: true }),
  ).toBeVisible();
});
test('staff receives inventory with an audit entry', async ({ page }) => {
  const settings = parseEnv(
    readFileSync('../horror-bookstore-backend/.env', 'utf8'),
  );
  const key = Object.values(JSON.parse(settings.STAFF_KEYS!))[0] as string;
  await page.goto('/staff');
  await page.getByLabel('Chave de acesso da equipe').fill(key);
  await page.getByRole('button', { name: 'Abrir painel' }).click();
  await page
    .getByRole('combobox', { name: 'Edição', exact: true })
    .selectOption('CARM-HC');
  await page.getByLabel('Alteração de quantidade').fill('1');
  const reason = 'Recebimento de teste ' + Date.now();
  await page.getByLabel('Motivo').fill(reason);
  await page.getByRole('button', { name: 'Salvar ajuste' }).click();
  await expect(page.getByText('Ajuste de estoque registrado.')).toBeVisible();
  await expect(page.getByText(reason, { exact: false })).toBeVisible();
});
