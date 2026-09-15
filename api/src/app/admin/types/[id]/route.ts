import { optionItemRoutes } from "@/lib/admin/option-routes";

export const dynamic = "force-dynamic";

const routes = optionItemRoutes("type");

export async function PATCH(request: Request, { params }: RouteContext<"/admin/types/[id]">) {
  return routes.PATCH(request, (await params).id);
}

export async function DELETE(request: Request, { params }: RouteContext<"/admin/types/[id]">) {
  return routes.DELETE(request, (await params).id);
}
