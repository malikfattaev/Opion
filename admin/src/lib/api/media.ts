import "server-only";

import { z } from "zod";

import type { MediaSort } from "@/config/site";

import { apiRead, apiRequest, apiUpload, type ApiResult } from "./client";

const mediaFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  bytes: z.number().nullable(),
  usedBy: z.number(),
  createdAt: z.string(),
});

const librarySchema = z.object({
  items: z.array(mediaFileSchema),
  stats: z.object({ files: z.number(), used: z.number(), bytes: z.number() }),
});

const uploadedSchema = z.object({ file: mediaFileSchema });
const emptySchema = z.undefined();

export type MediaFile = z.infer<typeof mediaFileSchema>;
export type MediaLibrary = z.infer<typeof librarySchema>;

export async function readMedia(query: string, sort: MediaSort): Promise<MediaLibrary> {
  const params = new URLSearchParams({ sort });

  if (query) {
    params.set("q", query);
  }

  return apiRead(`/admin/media?${params}`, librarySchema);
}

export async function uploadMedia(file: File): Promise<ApiResult<MediaFile>> {
  const result = await apiUpload("/admin/media", uploadedSchema, file);

  return result.ok ? { ok: true, data: result.data.file } : result;
}

export async function deleteMedia(id: string): Promise<ApiResult<undefined>> {
  return apiRequest(`/admin/media/${id}`, emptySchema, { method: "DELETE" });
}
