import Image from "next/image";

import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";

export function Logo({ height = brand.logo.headerHeight }: { height?: number }) {
  const { src, width, height: intrinsicHeight } = brand.logo;

  return (
    <Image
      src={src}
      alt={siteConfig.name}
      width={width}
      height={intrinsicHeight}
      priority
      style={{ height, width: "auto" }}
    />
  );
}
