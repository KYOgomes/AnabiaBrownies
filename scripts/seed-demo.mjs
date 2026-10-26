// Popula (ou reseta) o projeto Supabase de DEMONSTRAÇÃO com dados fictícios.
// Datas relativas a hoje, para a demo sempre parecer "atual".
//
// Uso:  node --env-file=.env.demo scripts/seed-demo.mjs
// .env.demo precisa de: DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY, DEMO_EMAIL, DEMO_PASSWORD
//
// NUNCA aponte para o projeto real: o script apaga todos os dados do usuário demo.

import { createClient } from "@supabase/supabase-js";

const { DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY, DEMO_EMAIL, DEMO_PASSWORD } = process.env;
if (!DEMO_SUPABASE_URL || !DEMO_SUPABASE_KEY || !DEMO_EMAIL || !DEMO_PASSWORD) {
  console.error("Faltam variáveis em .env.demo (DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY, DEMO_EMAIL, DEMO_PASSWORD).");
  process.exit(1);
}

const supabase = createClient(DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY, { auth: { persistSession: false } });
const { error: loginError } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
if (loginError) throw new Error(`Login do usuário demo falhou: ${loginError.message}`);

const must = async (p) => {
  const { data, error } = await p;
  if (error) throw error;
  return data;
};

// --- datas (fuso de Brasília) ---
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const addDays = (s, n) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekStart = (s) => addDays(s, -new Date(`${s}T00:00:00Z`).getUTCDay());

// --- aleatório determinístico (mesma demo a cada execução) ---
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// --- limpa tudo do usuário demo ---
for (const table of ["order_items", "orders", "daily_stock", "expenses", "price_options", "brownie_types", "customers"]) {
  await must(supabase.from(table).delete().not("id", "is", null));
}

// --- catálogo ---
const options = await must(
  supabase
    .from("price_options")
    .insert([
      { name: "1 brownie", quantity: 1, price: 7 },
      { name: "2 brownies", quantity: 2, price: 12 },
    ])
    .select("id, quantity, price"),
);
const types = await must(
  supabase
    .from("brownie_types")
    .insert([
      { name: "Tradicional" },
      { name: "Ninho" },
      { name: "Nutella" },
      { name: "Doce de leite" },
    ])
    .select("id, name"),
);
const weight = { Tradicional: 3, Ninho: 4, Nutella: 5, "Doce de leite": 2 }; // popularidade
const weighted = types.flatMap((t) => Array(weight[t.name]).fill(t.id));

const customers = Array.from({ length: 14 }, (_, i) => `Cliente ${String.fromCharCode(65 + i)}`);
const places = ["Portaria", "Retirada", "Escritório", "Faculdade", null, null];

// --- 3 semanas para trás + 2 dias à frente ---
let ordersCount = 0;
for (let offset = -20; offset <= 2; offset++) {
  const date = addDays(today, offset);
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (dow === 0) continue; // domingo de folga

  const sold = new Map(types.map((t) => [t.id, 0]));
  const nOrders = offset > 0 ? 0 : offset === 0 ? 6 : 4 + Math.floor(rand() * 5); // futuros: só produção
  for (let i = 0; i < nOrders; i++) {
    const option = rand() < 0.45 ? options.find((o) => o.quantity === 2) : options.find((o) => o.quantity === 1);
    const flavors = Array.from({ length: option.quantity }, () => pick(weighted));
    const paid = offset < -2 ? rand() < 0.95 : offset < 0 ? rand() < 0.7 : rand() < 0.5;
    const hour = 10 + Math.floor(rand() * 9);

    const order = await must(
      supabase
        .from("orders")
        .insert({
          date,
          customer_name: pick(customers),
          paid,
          payment_method: paid ? pick(["pix", "pix", "cash"]) : null,
          status: offset < 0 ? "delivered" : "pending",
          delivery_time: `${String(hour).padStart(2, "0")}:${pick(["00", "30"])}`,
          location: pick(places),
        })
        .select("id")
        .single(),
    );

    const counts = new Map();
    for (const f of flavors) counts.set(f, (counts.get(f) ?? 0) + 1);
    for (const [typeId, n] of counts) sold.set(typeId, sold.get(typeId) + n);
    const entries = [...counts];
    const cents = Math.round(Number(option.price) * 100);
    const shares = entries.map(([, n]) => Math.floor((cents * n) / option.quantity));
    shares[0] += cents - shares.reduce((a, b) => a + b, 0);

    await must(
      supabase.from("order_items").insert(
        entries.map(([typeId, n], k) => ({
          order_id: order.id,
          brownie_type_id: typeId,
          price_option_id: option.id,
          quantity: n,
          total: shares[k] / 100,
        })),
      ),
    );
    ordersCount++;
  }

  // produção do dia: sempre cobre as vendas; às vezes sobra 0 (dia esgotado)
  const extra = () => (offset === 0 ? 2 + Math.floor(rand() * 3) : rand() < 0.3 ? 0 : 1 + Math.floor(rand() * 3));
  await must(
    supabase
      .from("daily_stock")
      .insert(types.map((t) => ({ date, brownie_type_id: t.id, quantity: sold.get(t.id) + extra() }))),
  );
}

// --- despesas: compras semanais + algumas do dia ---
const expenses = [];
for (let w = 0; w < 3; w++) {
  const ws = weekStart(addDays(today, -7 * w));
  expenses.push(
    { date: ws, scope: "week", description: "Chocolate e cacau", amount: 68 + w * 4 },
    { date: ws, scope: "week", description: "Embalagens", amount: 25 },
  );
}
expenses.push(
  { date: addDays(today, -1), scope: "day", description: "Leite condensado", amount: 14.9 },
  { date: addDays(today, -4), scope: "day", description: "Ovos", amount: 18.5 },
  { date: today, scope: "day", description: "Creme de avelã", amount: 22 },
);
await must(supabase.from("expenses").insert(expenses));

console.log(`Demo pronta: ${types.length} sabores, ${options.length} opções, ${ordersCount} pedidos, ${expenses.length} despesas.`);
