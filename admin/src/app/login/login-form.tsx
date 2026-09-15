"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";
import { ErrorText, Field, inputClassName, PrimaryButton } from "@/components/ui";

const INITIAL: LoginState = { message: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <Field label="Логин">
        <input name="username" autoComplete="username" required className={inputClassName} />
      </Field>

      <Field label="Пароль">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClassName}
        />
      </Field>

      <ErrorText>{state.message}</ErrorText>

      <PrimaryButton type="submit" disabled={isPending}>
        {isPending ? "Проверяем…" : "Войти"}
      </PrimaryButton>
    </form>
  );
}
