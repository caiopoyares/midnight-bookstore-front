import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
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
  ).toBeLessThan(240);
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
  await page.getByRole('link', { name: 'Ver sacola (1)' }).click();
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
  const link = message.Text.match(
    /http:\/\/localhost:3000\/login#token=[a-f0-9]+/,
  )[0];
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
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.goto(receipt);
  await expect(
    page.getByText('Entre na sua conta para continuar.'),
  ).toBeVisible();
  await page.goto(link);
  await page.getByRole('button', { name: 'Confirmar acesso' }).click();
  await expect(page.locator('p[role=alert]')).toContainText('já foi usado');
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
