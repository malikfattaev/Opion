/** Корень отвечает коротко: сервис отдаёт только JSON, страниц здесь нет. */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    service: "opion-api",
    endpoints: ["/health", "/catalog", "/payment", "/orders"],
  });
}
