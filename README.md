# Anabia Brownies

Controle diário de produção, vendas, entregas e despesas de brownies. É um app web pensado para o celular (pode ser instalado na tela inicial como PWA).

**Stack:** Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Supabase (Postgres + Auth + RLS) · Vercel

## Funcionalidades (V1)

- **Calendário (tela inicial):** mês com vendidos/disponíveis por dia. Ao tocar num dia, abre o painel do dia logo abaixo, com:
  - quantidade de brownies disponíveis por sabor;
  - lista de pedidos com sabor, quem comprou, opção (ex.: 1 por R$ 7, 2 por R$ 12) e a caixinha **Pago** (pedidos pagos ficam apagados);
  - formulário rápido para adicionar pedido (avisa se passar do estoque);
  - despesas e lucro do dia.
- **Resumo:** lucro de hoje, da semana (dom–sáb), do mês e total, mais a lista do que ainda não foi pago.
- **Despesas:** compras lançadas para um dia ou para uma semana (domingo a sábado), escolhida num mini calendário.
- **Brownies:** opções de venda (quantidade + preço) e sabores, todos configuráveis.
- Tocar no nome de um pedido abre a edição, com data, horário, local, observações e status.

### Como o lucro é calculado

- **Vendas:** soma dos pedidos não cancelados, pela data de entrega. O valor vem da opção escolhida e fica gravado no pedido, então mudar o preço depois não altera o histórico.
- **Despesas do dia:** contam inteiras naquela data.
- **Despesas da semana:** valem para a semana (dom–sáb) da data escolhida. No lucro diário entra 1/7 do valor; no lucro semanal, o valor inteiro.
- **Lucro = vendas − despesas.** O campo "A receber" mostra os pedidos que ainda não foram pagos.

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode, nesta ordem, os arquivos de [supabase/migrations](supabase/migrations): `0001_init.sql`, `0002_grants.sql`, `0003_price_options.sql` e `0004_customer_name.sql`. Se o usuário for criado depois, cadastre as opções de venda na aba Brownies.
3. Em **Authentication → Users → Add user**, crie o usuário da vendedora (e-mail e senha, com "Auto confirm user" marcado).
4. Em **Authentication → Sign In / Providers**, desative "Allow new users to sign up". Assim ninguém consegue criar conta sozinho.
5. Em **Project Settings → API**, copie a *Project URL* e a *Publishable key*.

### 2. Rodar localmente

```bash
cp .env.example .env.local   # preencha com os valores do Supabase
npm install
npm run dev
```

Acesse http://localhost:3000.

### 3. Deploy na Vercel

1. Suba o repositório no GitHub e importe o projeto na Vercel.
2. Configure as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Faça o deploy. No celular, abra o site e use "Adicionar à tela inicial".

## Estrutura

```
src/
  app/
    login/                 login e logout
    (app)/                 telas autenticadas (com menu inferior)
      page.tsx             calendário + painel do dia (tela inicial)
      resumo/              lucro do dia, semana, mês e total
      pedido/              edição e ações de pedidos
      despesas/            despesas
      tipos/               sabores e opções de venda
    manifest.ts, pwa-icon/ PWA
  components/              componentes compartilhados
  lib/                     datas, formatação, cálculo financeiro, Supabase
  proxy.ts                 renova a sessão e protege as rotas
supabase/migrations/       schema do banco
```
