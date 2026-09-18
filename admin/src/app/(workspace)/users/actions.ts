"use server";

import { revalidatePath } from "next/cache";

import {
  createMember,
  deleteMember,
  updateMember,
  type MemberChanges,
  type MemberRole,
} from "@/lib/api/members";

export type MemberFormState = { message: string | null };

/**
 * Сохранение доступа. У нового участника пароль обязателен, у существующего
 * пустое поле означает «оставить прежний».
 */
export async function saveMember(_state: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const id = readText(formData, "id");
  const name = readText(formData, "name");
  const password = readText(formData, "password");
  const role = readRole(formData);

  if (!name) {
    return { message: "Укажите имя." };
  }

  if (password !== "" && password.length < 8) {
    return { message: "Пароль короче 8 символов." };
  }

  if (!id) {
    const username = readText(formData, "username");

    if (!username) {
      return { message: "Укажите логин." };
    }

    if (password === "") {
      return { message: "Придумайте пароль." };
    }

    const created = await createMember({ username, password, name, role });

    if (!created.ok) {
      return { message: created.message };
    }

    revalidatePath("/users");

    return { message: null };
  }

  const changes: MemberChanges = {
    name,
    role,
    isActive: formData.get("isActive") === "on",
    ...(password === "" ? {} : { password }),
  };

  const updated = await updateMember(id, changes);

  if (!updated.ok) {
    return { message: updated.message };
  }

  revalidatePath("/users");

  return { message: null };
}

export async function removeMember(_state: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const id = readText(formData, "id");

  if (!id) {
    return { message: "Некого удалять." };
  }

  const result = await deleteMember(id);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/users");

  return { message: null };
}

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function readRole(formData: FormData): MemberRole {
  return formData.get("role") === "OWNER" ? "OWNER" : "MANAGER";
}
