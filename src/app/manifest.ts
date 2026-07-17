import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeVault",
    short_name: "HomeVault",
    description:
      "A privacy-first home maintenance, warranty, receipt, asset and reminder vault.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/homevault.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/homevault.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
