# Midnight Books — loja

Loja de terror em português do Brasil, construída com Next.js, React e TypeScript. O navegador consulta diretamente o servidor da API para catálogo, conta, estoque e pedidos.

## Executar

Mantenha este repositório ao lado de horror-bookstore-backend. Na pasta do backend:

```sh
node scripts/setup-docker.mjs
docker compose up --build -d --wait
```

Acesse http://localhost:3000. Para entrar, solicite um link por e-mail e abra a mensagem recebida na caixa de desenvolvimento em http://localhost:8025. A sacola é preservada durante o login. A API exige autenticação antes de reservar os livros e iniciar a compra.

O catálogo demonstrativo contém 12 títulos e 14 edições com preços, estoque e capas conceituais. O desktop largo apresenta seis livros por linha, com seleção de edição e botão para adicionar à sacola. Os preços são exibidos em reais e as entregas estão configuradas para o Brasil.

A página **Minhas compras** reúne os pedidos da conta autenticada, com data, situação, total e acesso ao pedido. Pagamentos pendentes podem ser retomados por essa página.

## Desenvolver e testar

Para executar somente o frontend no computador:

```sh
npm ci
npm run dev
```

A API precisa estar em execução. Configure NEXT_PUBLIC_API_URL para o endereço público alcançável pelo navegador. No Docker, esse valor é um argumento de construção da imagem. STOREFRONT_URL no backend deve corresponder à origem da loja para permitir CORS e cookies. Use o mesmo hostname local, localhost, nos dois endereços.

As variáveis NEXT_PUBLIC_ são públicas e entram no código enviado ao navegador. Mantenha as senhas do banco, STAFF_KEYS e as credenciais de Stripe e Resend na configuração do backend. O Git ignora os arquivos .env e suas variantes; .env.example contém somente a URL pública de exemplo. Os relatórios e traces dos testes também são ignorados, pois podem conter dados da sessão de teste.

O contrato é versionado em contract/openapi-1.1.0.json. Ao atualizá-lo, execute npm run api:generate e npm run build.

Com o Compose em execução, rode os testes de navegador:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

A suíte verifica o catálogo, as requisições diretas para a API, o tamanho das capas, o recebimento de um link no Mailpit, a compra autenticada em tela móvel, a saída da conta, a proteção contra reutilização do link e um ajuste de estoque pela equipe. As compras e os ajustes de teste usam a base demonstrativa em execução.

As fontes Spectral e Inter e as imagens WebP são locais. As seis ilustrações originais também compõem as capas conceituais dos títulos adicionais. Os textos das capas são renderizados em português. Os prompts estão em artwork-prompts.txt.
