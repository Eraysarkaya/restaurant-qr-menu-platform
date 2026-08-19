import "dotenv/config";

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { connect } from "node:net";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  process.exit(0);
}

const databaseUrl = new URL(connectionString);
const isLocalDatabase = databaseUrl.hostname === "localhost" || databaseUrl.hostname === "127.0.0.1";

if (!isLocalDatabase) {
  process.exit(0);
}

const host = databaseUrl.hostname === "localhost" ? "127.0.0.1" : databaseUrl.hostname;
const port = Number(databaseUrl.port || 5432);
function isListening() {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(800);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

if (await isListening()) {
  console.log(`Yerel PostgreSQL hazır: ${host}:${port}`);
  process.exit(0);
}

console.log("Yerel Prisma Dev veritabanı başlatılıyor…");

const workingDirectory = fileURLToPath(new URL("..", import.meta.url));
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error("npm çalıştırma bilgisi bulunamadı. `npm run dev` komutunu kullanın.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [npmCli, "run", "db:dev:start", "--silent"],
  { cwd: workingDirectory, stdio: "inherit" },
);

if (result.error || result.status !== 0) {
  console.error("Prisma Dev başlatılamadı. İlk kurulum için `npm run db:dev` komutunu çalıştırın.");
  process.exit(1);
}

for (let attempt = 0; attempt < 20; attempt += 1) {
  if (await isListening()) {
    console.log(`Yerel PostgreSQL hazır: ${host}:${port}`);
    process.exit(0);
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.error(`Prisma Dev başladı ancak ${host}:${port} adresine ulaşılamıyor.`);
process.exit(1);
