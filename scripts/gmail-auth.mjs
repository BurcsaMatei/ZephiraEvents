/**
 * scripts/gmail-auth.mjs
 *
 * Generează refresh_token pentru Gmail readonly (OAuth2 installed app flow).
 *
 * Rulare:
 *   node scripts/gmail-auth.mjs
 *
 * Fără dependențe externe — folosește doar https și readline din Node.js.
 */

import https from "https";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── Paths ───────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SECRET_FILE = path.join(
  ROOT,
  "client_secret_421138611100-3f51ag0mhtulj3eeg2cl8cns0blkn2et.apps.googleusercontent.com.json",
);

// ─── Read client secret ───────────────────────────────────────────────────────

if (!fs.existsSync(SECRET_FILE)) {
  console.error(`\n❌ Fișier lipsă:\n   ${SECRET_FILE}\n`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SECRET_FILE, "utf8"));
const creds = raw.installed ?? raw.web;

if (!creds?.client_id || !creds?.client_secret) {
  console.error("❌ Fișierul JSON nu conține client_id / client_secret.");
  process.exit(1);
}

const CLIENT_ID = creds.client_id;
const CLIENT_SECRET = creds.client_secret;
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // "copy/paste" flow, fără server local
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

// ─── Build authorization URL ─────────────────────────────────────────────────

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // forțează returnarea refresh_token
  }).toString();

console.log("\n──────────────────────────────────────────────────────────────");
console.log("  Gmail OAuth2 — obținere refresh_token");
console.log("──────────────────────────────────────────────────────────────\n");
console.log("1. Deschide URL-ul de mai jos în browser:\n");
console.log("   " + authUrl);
console.log(
  "\n2. Autentifică-te cu contul Gmail dorit și aprobă accesul.",
);
console.log(
  "3. Google îți va afișa un cod de autorizare — copiază-l integral.\n",
);

// ─── Read authorization code from stdin ──────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Introdu codul de autorizare: ", (code) => {
  rl.close();
  const trimmed = code.trim();
  if (!trimmed) {
    console.error("\n❌ Cod gol — abandonat.\n");
    process.exit(1);
  }
  exchangeCode(trimmed);
});

// ─── Exchange code for tokens ────────────────────────────────────────────────

function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }).toString();

  const options = {
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        console.error("\n❌ Răspuns invalid de la Google:\n", data);
        process.exit(1);
      }

      if (parsed.error) {
        console.error(
          `\n❌ Eroare Google: ${parsed.error} — ${parsed.error_description ?? ""}\n`,
        );
        process.exit(1);
      }

      console.log("\n──────────────────────────────────────────────────────────────");
      console.log("  ✅ Tokens obținuți cu succes!");
      console.log("──────────────────────────────────────────────────────────────\n");

      if (parsed.refresh_token) {
        console.log("GMAIL_REFRESH_TOKEN=" + parsed.refresh_token);
      } else {
        console.warn(
          "⚠️  refresh_token lipsă în răspuns.\n" +
            "   Cauza probabilă: contul a fost deja autorizat anterior.\n" +
            "   Revocă accesul din https://myaccount.google.com/permissions\n" +
            "   și rulează scriptul din nou.\n",
        );
      }

      if (parsed.access_token) {
        console.log("\nACCESS_TOKEN (expiră în ~1h, nu îl salva):");
        console.log(parsed.access_token);
      }

      console.log(
        "\nAdaugă GMAIL_REFRESH_TOKEN în .env.local și în Vercel Environment Variables.\n",
      );
    });
  });

  req.on("error", (err) => {
    console.error("\n❌ Eroare rețea:", err.message, "\n");
    process.exit(1);
  });

  req.write(body);
  req.end();
}
