import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const dist = join(root, "dist");
const html = await readFile(join(root, "index.html"), "utf8");
const hosting = await readFile(join(root, ".openai", "hosting.json"), "utf8");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server"), { recursive: true });
await mkdir(join(dist, ".openai"), { recursive: true });

const server = `const html = ${JSON.stringify(html)};

export default {
  async fetch() {
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache"
      }
    });
  }
};
`;

await writeFile(join(dist, "server", "index.js"), server);
await writeFile(join(dist, ".openai", "hosting.json"), hosting);

