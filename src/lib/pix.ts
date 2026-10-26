// Gera o "BR Code" do Pix estático (o texto do QR / "Pix copia e cola"),
// conforme o Manual de Padrões para Iniciação do Pix do Banco Central.

function field(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), em 4 dígitos hex. */
export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Remove acentos e caracteres fora do permitido; corta no tamanho máximo. */
function clean(s: string, max: number) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, max);
}

export function pixPayload({
  key,
  name,
  city,
  amount,
  txid = "***",
}: {
  key: string;
  name: string;
  city: string;
  amount?: number; // sem valor: quem paga digita
  txid?: string;
}) {
  const body =
    field("00", "01") + // versão do payload
    field("01", "11") + // QR estático (reutilizável)
    field("26", field("00", "br.gov.bcb.pix") + field("01", key)) +
    field("52", "0000") + // categoria do comerciante
    field("53", "986") + // moeda: BRL
    (amount ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", clean(name, 25)) +
    field("60", clean(city, 15)) +
    field("62", field("05", txid));
  const withCrcId = body + "6304";
  return withCrcId + crc16(withCrcId);
}

/**
 * Deixa a chave no formato que o Pix espera: telefone "+55DDDNUMERO", CPF/CNPJ
 * só dígitos, e-mail minúsculo, chave aleatória como está.
 */
export function normalizePixKey(raw: string) {
  const key = raw.trim();
  if (key.includes("@")) return key.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return key.toLowerCase();
  const digits = key.replace(/\D/g, "");
  if (key.startsWith("+")) return `+${digits}`;
  if (digits.length === 11 && /^\d{2}9/.test(digits) && !isCpf(digits)) return `+55${digits}`; // celular sem +55
  if (digits.length === 13 && digits.startsWith("55")) return `+${digits}`;
  return digits || key; // CPF (11) ou CNPJ (14)
}

function isCpf(d: string) {
  if (/^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    return ((sum * 10) % 11) % 10;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

/** Configuração vinda das variáveis de ambiente (a chave não fica no código). */
export function pixConfig() {
  const raw = process.env.PIX_KEY?.trim();
  if (!raw) return null;
  const key = normalizePixKey(raw);
  return {
    key,
    name: process.env.PIX_NAME?.trim() || "Anabia Brownies",
    city: process.env.PIX_CITY?.trim() || "Belo Horizonte",
  };
}
