import { optionItemRoutes } from "@/lib/admin/option-routes";

export const dynamic = "force-dynamic";

const routes = optionItemRoutes("style");

export async function PATCH(request: Request, { params }: RouteContext<"/admin/styles/[id]">) {
  return routes.PATCH(request, (await params).id);
}

export async function DELETE(request: Request, { params }: RouteContext<"/admin/styles/[id]">) {
  return routes.DELETE(request, (await params).id);
}
