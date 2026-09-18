"use client";

import { useActionState, useState } from "react";

import { removeMember, saveMember, type MemberFormState } from "@/app/(workspace)/users/actions";
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
  Select,
} from "@/components/ui";
import { adminRoleLabels } from "@/config/site";
import type { AdminMember } from "@/lib/api/members";
import { formatDate } from "@/lib/money";

const INITIAL: MemberFormState = { message: null };

/** `null` - окно закрыто, пустой объект - заводим нового участника. */
type Editing = { member?: AdminMember } | null;

/** Кто заходит в админку. Правит список только владелец. */
export function MembersManager({ members, currentId }: { members: readonly AdminMember[]; currentId: string }) {
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <>
      <PageHeader
        title="Пользователи"
        action={
          <button
            type="button"
            onClick={() => setEditing({})}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-contrast transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" />
            Добавить доступ
          </button>
        }
      />

      {members.length === 0 ? (
        <EmptyState>Пока пусто.</EmptyState>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-widest whitespace-nowrap text-ink-muted uppercase">
                <th scope="col" className="w-2/5 px-4 py-3 font-normal">
                  Имя
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Логин
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Роль
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Доступ
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {members.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-surface/50">
                  <td className="px-4 py-4">
                    <p>{member.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">с {formatDate(member.createdAt)}</p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md border border-line px-2 py-1 font-mono text-xs whitespace-nowrap">
                      {member.username}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {adminRoleLabels[member.role] ?? member.role}
                  </td>

                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-xs whitespace-nowrap text-ink-muted">
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-full ${member.isActive ? "bg-success" : "bg-ink-muted/50"}`}
                      />
                      {member.isActive ? "открыт" : "закрыт"}
                    </span>
                  </td>

                  <td className="py-4 pr-4 pl-2">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Изменить" onClick={() => setEditing({ member })}>
                        <PencilIcon className="size-4" />
                      </IconButton>

                      {member.id === currentId ? null : <RemoveMember member={member} />}
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
        title={editing?.member ? "Изменить доступ" : "Новый доступ"}
        onClose={() => setEditing(null)}
      >
        {editing === null ? null : (
          <MemberForm
            member={editing.member}
            onDone={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}

function MemberForm({
  member,
  onDone,
  onCancel,
}: {
  member?: AdminMember;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (previous: MemberFormState, formData: FormData) => {
      const next = await saveMember(previous, formData);

      if (next.message === null) {
        onDone();
      }

      return next;
    },
    INITIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <Field label="Имя">
        <input name="name" defaultValue={member?.name} required autoFocus className={inputClassName} />
      </Field>

      {member ? null : (
        <Field label="Логин" hint="латиницей">
          <input name="username" required className={`${inputClassName} font-mono`} />
        </Field>
      )}

      <Field label="Пароль" hint={member ? "оставьте пустым, чтобы не менять" : "от 8 символов"}>
        <input
          name="password"
          type="text"
          autoComplete="new-password"
          required={!member}
          className={`${inputClassName} font-mono`}
        />
      </Field>

      <Field label="Роль">
        <Select name="role" defaultValue={member?.role ?? "MANAGER"}>
          <option value="MANAGER">Менеджер</option>
          <option value="OWNER">Владелец</option>
        </Select>
      </Field>

      {member ? (
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={member.isActive}
            className="size-4 accent-[var(--color-accent)]"
          />
          Доступ открыт
        </label>
      ) : null}

      <ErrorText>{state.message}</ErrorText>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={isPending}>
          {isPending ? "Сохраняем…" : member ? "Сохранить" : "Добавить"}
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

function RemoveMember({ member }: { member: AdminMember }) {
  const [state, formAction, isPending] = useActionState(removeMember, INITIAL);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <ErrorText>{state.message}</ErrorText>

      <input type="hidden" name="id" value={member.id} />

      <IconButton
        label="Удалить"
        type="submit"
        tone="danger"
        disabled={isPending}
        onClick={(event) => {
          if (!window.confirm(`Закрыть доступ «${member.name}» и удалить его?`)) {
            event.preventDefault();
          }
        }}
      >
        <TrashIcon className="size-4" />
      </IconButton>
    </form>
  );
}
