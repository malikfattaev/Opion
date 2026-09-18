import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/app/login/login-form";
import { adminConfig } from "@/config/site";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Image
          src={adminConfig.logo.src}
          alt={adminConfig.wordmark}
          width={adminConfig.logo.width}
          height={adminConfig.logo.height}
          priority
          style={{ height: 28, width: "auto" }}
          className="mx-auto"
        />

        <h1 className="mt-10 text-center font-display text-3xl leading-tight">Админка</h1>

        <LoginForm />
      </div>
    </main>
  );
}
