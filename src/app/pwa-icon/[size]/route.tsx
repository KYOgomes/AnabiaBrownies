import { ImageResponse } from "next/og";

export async function GET(_req: Request, ctx: RouteContext<"/pwa-icon/[size]">) {
  const { size: raw } = await ctx.params;
  const size = raw === "192" ? 192 : 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5b3a29",
        }}
      >
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: size * 0.08,
            background: "#3b2418",
            border: `${size * 0.03}px solid #c8873a`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff8f1",
            fontSize: size * 0.22,
            fontWeight: 700,
          }}
        >
          AB
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
