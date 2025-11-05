// lib/mail/offerRequestEmail.ts
// ==============================
// Imports
// ==============================
import { ddmmyyyyFromYmd } from "../validation/offerRequest";

// ==============================
// Types
// ==============================
export interface EmailData {
  name: string;
  address: string;
  phone: string;
  whatsapp: boolean;
  email: string;
  eventDateYmd: string;
  participants: number;
  menu: string;
  lodging: { kind: "proprie" | "oferta"; rooms: string; nights: string; notes: string };
  music: { kind: "am-eu" | "oferta"; prefs: string; genre: string; interval: string };
  photoVideo: { kind: "am-eu" | "oferta"; package: string; duration: string; deliverables: string };
  details: string;
}

// ==============================
// Utils
// ==============================
function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]!,
  );
}

function yn(b: boolean): "Da" | "Nu" {
  return b ? "Da" : "Nu";
}

function fmtKV(k: string, v: string): string {
  return `<tr><td style="padding:6px 10px;border:1px solid #e5e5e5;"><strong>${esc(k)}</strong></td><td style="padding:6px 10px;border:1px solid #e5e5e5;">${esc(v)}</td></tr>`;
}

// ==============================
// Builder
// ==============================
export function buildOfferEmail(data: EmailData): { subject: string; html: string; text: string } {
  const subject = "Confirmare solicitare ofertă — ZephiraEvents";
  const dateRo = ddmmyyyyFromYmd(data.eventDateYmd);

  const lodgingSummary =
    data.lodging.kind === "oferta"
      ? `Doresc ofertă (camere: ${data.lodging.rooms || "-"}, nopți: ${data.lodging.nights || "-"}, obs: ${data.lodging.notes || "-"})`
      : "Cazare proprie";

  const musicSummary =
    data.music.kind === "oferta"
      ? `Doresc ofertă (preferințe: ${data.music.prefs || "-"}, gen: ${data.music.genre || "-"}, interval: ${data.music.interval || "-"})`
      : "Am eu";

  const pvSummary =
    data.photoVideo.kind === "oferta"
      ? `Doresc ofertă (pachet: ${data.photoVideo.package || "-"}, durată: ${data.photoVideo.duration || "-"}, livrabile: ${data.photoVideo.deliverables || "-"})`
      : "Am eu";

  const html =
    `<div style="font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;color:#111">` +
    `<h2 style="margin:0 0 8px;">Salut, ${esc(data.name)}!</h2>` +
    `<p>Îți mulțumim pentru solicitare. Am primit detaliile și le vom analiza cu atenție. Revenim în 24–48 ore cu o propunere personalizată.</p>` +
    `<table role="presentation" style="border-collapse:collapse;border:1px solid #e5e5e5;margin:16px 0;width:100%;max-width:720px;">` +
    fmtKV("Nume", data.name) +
    fmtKV("Adresă", data.address) +
    fmtKV("Telefon", `${data.phone} (WhatsApp: ${yn(data.whatsapp)})`) +
    fmtKV("Data eveniment", dateRo) +
    fmtKV("Număr participanți", String(data.participants)) +
    fmtKV("Meniu dorit", data.menu) +
    fmtKV("Cazare", lodgingSummary) +
    fmtKV("Muzică", musicSummary) +
    fmtKV("Foto-video", pvSummary) +
    fmtKV("E-mail", data.email) +
    fmtKV("Detalii suplimentare", data.details || "-") +
    `</table>` +
    `<p><strong>Contact rapid:</strong> <a href="https://wa.me/40769990800">WhatsApp</a> • <a href="https://zephiraevents.ro/servicii#oferte-de-meniu">Meniuri</a></p>` +
    `<p style="margin-top:16px;font-size:13px;color:#555;">Folosim datele pentru a răspunde solicitării tale, conform politicilor noastre.</p>` +
    `<hr style="border:none;height:1px;background:#eee;margin:16px 0;" />` +
    `<p style="font-size:13px;color:#555;margin:0;">ZephiraEvents<br/>Calea Odobești 409, Comuna Câmpineanca, Județul Vrancea, 627055 RO<br/>+40 769 990 800 • <a href="mailto:info@zephiraevents.ro">info@zephiraevents.ro</a> • <a href="https://zephiraevents.ro">zephiraevents.ro</a></p>` +
    `</div>`;

  const text =
    `Salut, ${data.name}!\n\n` +
    `Îți mulțumim pentru solicitare. Am primit detaliile și le vom analiza cu atenție. Revenim în 24–48 ore cu o propunere personalizată.\n\n` +
    `Nume: ${data.name}\n` +
    `Adresă: ${data.address}\n` +
    `Telefon: ${data.phone} (WhatsApp: ${yn(data.whatsapp)})\n` +
    `Data eveniment: ${dateRo}\n` +
    `Număr participanți: ${data.participants}\n` +
    `Meniu dorit: ${data.menu}\n` +
    `Cazare: ${lodgingSummary}\n` +
    `Muzică: ${musicSummary}\n` +
    `Foto-video: ${pvSummary}\n` +
    `E-mail: ${data.email}\n` +
    `Detalii suplimentare: ${data.details || "-"}\n\n` +
    `Contact rapid: WhatsApp https://wa.me/40769990800 • Meniuri https://zephiraevents.ro/servicii#oferte-de-meniu\n\n` +
    `ZephiraEvents • Calea Odobești 409, Comuna Câmpineanca, Județul Vrancea, 627055 RO • +40 769 990 800 • info@zephiraevents.ro • https://zephiraevents.ro`;

  return { subject, html, text };
}
