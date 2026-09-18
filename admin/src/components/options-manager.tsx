"use client";

import { useActionState, useState } from "react";

import { removeOption, saveOption, type OptionFormState } from "@/app/(workspace)/options-actions";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import {
  EmptyState,
  ErrorText,
  Field,
  IconButton,
  inputClassName,
  PageHeader,
  PrimaryButton,
} from "@/components/ui";
import { optionSections, type OptionKind } from "@/config/site";
import type { AdminOption } from "@/lib/api/catalog";

const INITIAL: OptionFormState = { message: null };

/** Что правим прямо сейчас: `null` - окно закрыто, пустой объект - создаём новое. */
type Editing = { option?: AdminOption } | null;

/**
 * Список типов или стилей. Раздел один и тот же по устройству, поэтому
 * отличается только подписями и адресом API.
 */
export function OptionsManager({ kind, options }: { kind: OptionKind; options: readonly AdminOption[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const titles = optionSections[kind];

  return (
    <>
      <PageHeader
        title={titles.plural}
        action={
          <button
            type="button"
            onClick={() => setEditing({})}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-contrast transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" />
            {titles.add}
          </button>
        }
      />

      {options.length === 0 ? (
        <EmptyState>Пока пусто.</EmptyState>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-widest whitespace-nowrap text-ink-muted uppercase">
                <th scope="col" className="w-2/5 px-4 py-3 font-normal">
                  Название
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Адрес
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Вещей
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {options.map((option) => (
                <tr key={option.id} className="transition-colors hover:bg-surface/50">
                  <td className="px-4 py-4">{option.name}</td>

                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md border border-line px-2 py-1 font-mono text-xs whitespace-nowrap">
                      {option.slug}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-ink-muted tabular-nums">
                    {option.productCount === 0 ? "—" : option.productCount}
                  </td>

                  <td className="py-4 pr-4 pl-2">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Изменить" onClick={() => setEditing({ option })}>
                        <PencilIcon className="size-4" />
                      </IconButton>

                      <RemoveOption kind={kind} option={option} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing?.option ? titles.edit : titles.create}
        onClose={() => setEditing(null)}
      >
        {editing === null ? null : (
          <OptionForm
            kind={kind}
            option={editing.option}
            submitLabel={editing.option ? "Сохранить" : "Добавить"}
            onDone={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
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
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (previous: OptionFormState, formData: FormData) => {
      const next = await saveOption(previous, formData);

      if (next.message === null) {
        onDone();
      }

      return next;
    },
    INITIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="kind" value={kind} />
      {option ? <input type="hidden" name="id" value={option.id} /> : null}

      <Field label="Название">
        <input name="name" defaultValue={option?.name} required autoFocus className={inputClassName} />
      </Field>

      <Field label="Адрес" hint="латиницей">
        <input
          name="slug"
          defaultValue={option?.slug}
          required
          placeholder="hoodie"
          className={`${inputClassName} font-mono`}
        />
      </Field>

      <ErrorText>{state.message}</ErrorText>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={isPending}>
          {isPending ? "Сохраняем…" : submitLabel}
        </PrimaryButton>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

function RemoveOption({ kind, option }: { kind: OptionKind; option: AdminOption }) {
  const [state, formAction, isPending] = useActionState(removeOption, INITIAL);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={option.id} />

      <ErrorText>{state.message}</ErrorText>

      <IconButton
        label="Удалить"
        type="submit"
        tone="danger"
        disabled={isPending}
        onClick={(event) => {
          if (!window.confirm(`Удалить «${option.name}»?`)) {
            event.preventDefault();
          }
        }}
      >
        <TrashIcon className="size-4" />
      </IconButton>
    </form>
  );
}
