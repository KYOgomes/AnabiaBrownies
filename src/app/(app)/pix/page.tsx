import QRCode from "qrcode";
import { pixConfig, pixPayload } from "@/lib/pix";
import { requireUser } from "@/lib/supabase/server";
import { CopyButton } from "./copy-button";

export const metadata = { title: "Pix · Anabia Brownies" };

export default async function PixPage() {
  await requireUser();
  const config = pixConfig();

  if (!config) {
    return (
      <div className="card text-sm">
        <h1 className="mb-2 font-display text-xl font-semibold">Pix não configurado</h1>
        <p className="text-muted">
          Defina a variável de ambiente <code>PIX_KEY</code> (e opcionalmente <code>PIX_NAME</code> e{" "}
          <code>PIX_CITY</code>) na Vercel e faça um novo deploy.
        </p>
      </div>
    );
  }

  const payload = pixPayload(config);
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2b1d16", light: "#ffffff" },
  });

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">Pague com Pix</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">{config.name}</h1>

      <div
        className="mt-5 w-full max-w-sm rounded-3xl bg-white p-4 shadow-lg ring-4 ring-primary [&>svg]:h-auto [&>svg]:w-full"
        role="img"
        aria-label={`QR code Pix de ${config.name}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <ol className="mt-5 max-w-sm space-y-1 text-left text-sm text-muted">
        <li>1. Abra o app do seu banco e escolha <strong className="text-foreground">Pix → Ler QR code</strong>.</li>
        <li>2. Aponte a câmera para o código acima.</li>
        <li>3. <strong className="text-foreground">Digite o valor</strong> do seu pedido e confirme.</li>
      </ol>

      <div className="mt-5 w-full max-w-sm">
        <CopyButton text={payload} />
      </div>
    </div>
  );
}
