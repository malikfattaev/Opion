"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/api/session";

export type LoginState = { message: string | null };

/** Вход: форма отправляется на сервер, пароль в браузерном состоянии не оседает. */
export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { message: "Заполните логин и пароль." };
  }

  const result = await signIn(username, password);

  if (!result.ok) {
    return { message: result.message };
  }

  redirect("/products");
}

/** Выход из админки. Токен гасится и на стороне API. */
export async function logout(): Promise<void> {
  await signOut();
  redirect("/login");
}
