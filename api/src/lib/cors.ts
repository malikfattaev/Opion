import "server-only";

import { allowedOrigins } from "@/lib/env";
import { INIT_DATA_HEADER } from "@/lib/telegram/headers";

/**
 * Витрины живут на своих доменах, поэтому браузер обязан получить разрешение.
 * Список доменов задаётся переменной окружения: звёздочку не ставим, иначе
 * к API сможет обратиться любая страница в интернете.
 */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins().includes(origin.replace(/\/+$/, ""))) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": `Content-Type,${INIT_DATA_HEADER}`,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function jsonResponse(request: Request, body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, { ...init, headers: { ...corsHeaders(request), ...init.headers } });
}

/** Предварительный запрос браузера перед POST с файлом. */
export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
