/**
 * Проверка живости для Railway и мониторинга.
 * `force-dynamic` — иначе Next.js закеширует ответ на этапе сборки,
 * и проверка перестанет что-либо проверять.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
