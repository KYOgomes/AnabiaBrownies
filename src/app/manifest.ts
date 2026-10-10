import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anabia Brownies",
    short_name: "Anabia",
    description: "Controle de produção, vendas e entregas de brownies",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6f0",
    theme_color: "#5b3a29",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
