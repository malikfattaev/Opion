"use client";

import { useActionState, useState } from "react";

import { removeOption, saveOption, type OptionFormState } from "@/app/(workspace)/options-actions";
import { Card, ErrorText, Field, inputClassName, PrimaryButton } from "@/components/ui";
import type { AdminOption, OptionKind } from "@/lib/api/catalog";

const INITIAL: OptionFormState = { message: null };

/**
 * Список типов или стилей с формой добавления. Раздел один и тот же по устройству,
 * поэтому отличается только подписями и адресом API.
 */
export function OptionsManager({
  kind,
  title,
  options,
}: {
  kind: OptionKind;
  title: string;
  options: readonly AdminOption[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
      <section>
        <h2 className="text-xs tracking-widest text-ink-muted uppercase">Список</h2>

        {options.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">Пока пусто. Добавьте первый раздел справа.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {options.map((option) => (
              <li key={option.id} className="py-4">
                {editingId === option.id ? (
                  <OptionForm
                    kind={kind}
                    option={option}
                    submitLabel="Сохранить"
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-sm">{option.name}</span>
                    <span className="text-xs text-ink-muted">{option.slug}</span>
                    <span className="text-xs text-ink-muted">
                      {option.productCount === 0 ? "не используется" : `вещей: ${option.productCount}`}
                    </span>

                    <div className="ml-auto flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setEditingId(option.id)}
                        className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink"
                      >
                        Изменить
                      </button>

                      <RemoveOption kind={kind} id={option.id} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="h-fit">
        <h2 className="text-xs tracking-widest text-ink-muted uppercase">Добавить {title.toLowerCase()}</h2>

        <div className="mt-5">
          <OptionForm kind={kind} submitLabel="Добавить" />
        </div>
      </Card>
    </div>
  );
}

function OptionForm({
  kind,
  option,
  submitLabel,
  onDone,
  onCancel,
}: {
  kind: OptionKind;
  option?: AdminOption;
  submitLabel: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (previous: OptionFormState, formData: FormData) => {
      const next = await saveOption(previous, formData);

      if (next.message === null) {
        onDone?.();
      }

      return next;
    },
    INITIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="kind" value={kind} />
      {option ? <input type="hidden" name="id" value={option.id} /> : null}

      <Field label="Название">
        <input name="name" defaultValue={option?.name} required className={inputClassName} />
      </Field>

      <Field label="Адрес" hint="латиницей">
        <input
          name="slug"
          defaultValue={option?.slug}
          required
          placeholder="hoodie"
          className={inputClassName}
        />
      </Field>

      <ErrorText>{state.message}</ErrorText>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={isPending}>
          {isPending ? "Сохраняем…" : submitLabel}
        </PrimaryButton>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}

function RemoveOption({ kind, id }: { kind: OptionKind; id: string }) {
  const [state, formAction, isPending] = useActionState(removeOption, INITIAL);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />

      <ErrorText>{state.message}</ErrorText>

      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-ink-muted underline underline-offset-4 hover:text-danger disabled:opacity-40"
      >
        Удалить
      </button>
    </form>
  );
}
