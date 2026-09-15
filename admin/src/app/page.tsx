import { redirect } from "next/navigation";

/** Корень админки: сразу к товарам, отдельной сводки пока нет. */
export default function RootPage() {
  redirect("/products");
}
