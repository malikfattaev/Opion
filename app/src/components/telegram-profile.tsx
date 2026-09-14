"use client";

import { useTelegramProfile } from "@/lib/telegram/use-telegram";

/**
 * Шапка меню: аватар и имя из Telegram, как в профиле мессенджера.
 * Вне Telegram профиля нет, поэтому показываем нейтральную заглушку.
 */
export function TelegramProfileCard() {
  const profile = useTelegramProfile();

  const name = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : "Гость";
  const subtitle = profile?.username ? `@${profile.username}` : "Войдите через Telegram";

  return (
    <div className="flex items-center gap-4">
      <Avatar photoUrl={profile?.photo_url} name={name} />

      <div className="min-w-0">
        <p className="truncate text-lg leading-tight">{name}</p>
        <p className="mt-0.5 truncate text-sm text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Avatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  const className = "size-16 shrink-0 rounded-full object-cover";

  if (photoUrl) {
    return (
      /* Обычный img, а не next/image: аватар лежит на домене Telegram, который
         меняется без предупреждения, и оптимизировать 64 пикселя незачем. */
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" width={64} height={64} className={className} />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-surface text-xl text-ink-muted`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
