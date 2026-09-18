import "server-only";

import { z } from "zod";

import { apiRead, apiRequest, type ApiResult } from "./client";
import { memberSchema as sessionMemberSchema, type Member } from "./session";

const memberSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  role: z.enum(["OWNER", "MANAGER"]),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type AdminMember = z.infer<typeof memberSchema>;
export type MemberRole = AdminMember["role"];

export type MemberInput = {
  username: string;
  password: string;
  name: string;
  role: MemberRole;
};

export type MemberChanges = {
  name?: string;
  role?: MemberRole;
  isActive?: boolean;
  password?: string;
};

/** Кто именно сейчас в админке: по нему решаем, что можно показывать. */
export async function readMe(): Promise<Member> {
  return (await apiRead("/admin/me", z.object({ member: sessionMemberSchema }))).member;
}

export async function listMembers(): Promise<AdminMember[]> {
  return (await apiRead("/admin/members", z.object({ members: z.array(memberSchema) }))).members;
}

export async function createMember(input: MemberInput): Promise<ApiResult<unknown>> {
  return apiRequest("/admin/members", z.unknown(), { method: "POST", body: input });
}

export async function updateMember(id: string, changes: MemberChanges): Promise<ApiResult<unknown>> {
  return apiRequest(`/admin/members/${id}`, z.unknown(), { method: "PATCH", body: changes });
}

export async function deleteMember(id: string): Promise<ApiResult<undefined>> {
  return apiRequest(`/admin/members/${id}`, z.undefined(), { method: "DELETE" });
}
