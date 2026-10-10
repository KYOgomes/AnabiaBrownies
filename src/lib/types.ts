export type BrownieType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
};

export type OrderStatus = "pending" | "delivered" | "cancelled";
export type PaymentMethod = "pix" | "cash" | "card";

export type PriceOption = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  active: boolean;
};

export type OrderItem = {
  id: string;
  brownie_type_id: string;
  price_option_id: string | null;
  quantity: number;
  total: number;
  brownie_types: { name: string } | null;
  price_options: { name: string } | null;
};

export type Order = {
  id: string;
  date: string;
  delivery_time: string | null;
  location: string | null;
  notes: string | null;
  status: OrderStatus;
  paid: boolean;
  payment_method: PaymentMethod | null;
  customer_name: string | null;
  order_items: OrderItem[];
};

export type Expense = {
  id: string;
  date: string;
  description: string;
  amount: number;
  scope: "day" | "week";
};

export const ORDER_SELECT =
  "id, date, delivery_time, location, notes, status, paid, payment_method, customer_name, order_items(id, brownie_type_id, price_option_id, quantity, total, brownie_types(name), price_options(name))";

/** "Ninho", "Ninho + Nutella" ou "2× Ninho + Nutella" */
export function orderFlavors(o: Pick<Order, "order_items">) {
  return (
    o.order_items
      .map((i) => `${i.quantity > 1 && o.order_items.length > 1 ? `${i.quantity}× ` : ""}${i.brownie_types?.name ?? "?"}`)
      .join(" + ") || "?"
  );
}

export function orderTotal(o: Pick<Order, "order_items">) {
  return o.order_items.reduce((s, i) => s + Number(i.total), 0);
}
