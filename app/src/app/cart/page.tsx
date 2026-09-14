import type { Metadata } from "next";

import { CartContents } from "@/components/cart-contents";

export const metadata: Metadata = { title: "Корзина" };

export default function CartPage() {
  return <CartContents />;
}
